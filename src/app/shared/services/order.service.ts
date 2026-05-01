import { FirebaseErrorService } from '../../core/services/firebase.error.service';
import { inject, Injectable, signal } from "@angular/core";
import { collection, collectionData, doc, Firestore, getDocs, query, where } from "@angular/fire/firestore";
import { fireStoreCollections } from "../../../environments/environment";
import {
  BehaviorSubject,
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from "rxjs";
import { Buyer, Seller, User } from "../../features/auth/user";
import { Order } from "../../core/interfaces/order";
import { Product } from "../../core/interfaces/product";
import { normalizeDate } from "../methods";
import { runTransaction, Transaction } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class OrderService {
  fireStore = inject(Firestore);
  firebaseErrorService = inject(FirebaseErrorService);
  userCollectionRef = collection(this.fireStore, fireStoreCollections.users);
  productCollectionRef = collection(this.fireStore, fireStoreCollections.products);
  ordersCollectionRef = collection(this.fireStore, fireStoreCollections.orders);
  numberOfOrders = new BehaviorSubject<number>(0);
  selectedStatus = signal<string>('All');
  startDate = signal<string>('');
  endDate = signal<string>('');

  getAllOrders() {
    let ordersCollection = collectionData(query(this.ordersCollectionRef));
    return ordersCollection.pipe(
      map((orders) => {
        let o = orders as Order[];
        return o ?? [];
      }),
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return of([]);
      }),
    );
  }

  getMyOrders() {

    this.numberOfOrders.next(0)
    let user = collectionData(query(this.userCollectionRef, where('uid', '==', localStorage.getItem('token')!)));
    return user.pipe(
      switchMap((users) => {
        let ordersObs: Observable<Order[]>;
        let user = users[0] as Buyer;
        this.numberOfOrders.next(user.ordersIds.length);
        if (!user.ordersIds?.length) {
          return of([]);
        }
        let orderReqs = user.ordersIds.map((id) => this.getOrderById(id));
        ordersObs = forkJoin(
          orderReqs
        )
        return ordersObs;
      }),
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return of([]);
      }),
    )
  }

  getOrdersByStatus(status: string) {
    let ordersCollection = collectionData(query(this.ordersCollectionRef));
    return ordersCollection.pipe(
      map((orders) => {
        let x = orders as Order[]
        return x?.filter((order) => order.status == status) ?? [];
      }),
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return of([]);
      }),
    )
  }



  changeStatusOrder(orderId: string, newStatus: "PENDING" | "SHIPPED" | "CANCELLED" | "DELIVERED") {
    const orderRef = doc(this.fireStore, fireStoreCollections.orders, orderId);

    return from(runTransaction(this.fireStore, async (transaction) => {
      // 1. READ order
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) throw new Error('Order not found');
      const order = orderSnap.data() as Order;
      if (order.status === newStatus || newStatus !== 'SHIPPED') return;

      const userRef = doc(this.fireStore, fireStoreCollections.users, localStorage.getItem('token')!);

      const userSnap = await transaction.get(userRef)

      const userData = userSnap.data() as User;

      if (userData.role != 'admin') {
        throwError(() => new Error("Can't do this action"))
        return;
      }

      // 2. FIRST PASS: READ ALL products and accumulate seller changes
      const sellerChanges = new Map<string, { soldItems: number; revenue: number }>();
      const productUpdates: { productRef: any; newStock: number }[] = [];

      await this.setProductAndSellerChanges(order, transaction, productUpdates, sellerChanges);

      // 3. SECOND PASS: READ each seller ONCE (after accumulating all changes)
      const sellerUpdates: { sellerRef: any; newSoldItems: number; newRevenue: number; }[] = await this.setSellerUpdates(sellerChanges, transaction);

      // 4. THIRD PASS: WRITE all updates (products and sellers)
      this.writeProductsAndSellersAndStatus(productUpdates, transaction, sellerUpdates, orderRef, newStatus);

    })).pipe(
      catchError((err) => {
        this.firebaseErrorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
  private writeProductsAndSellersAndStatus(productUpdates: { productRef: any; newStock: number; }[], transaction: Transaction, sellerUpdates: { sellerRef: any; newSoldItems: number; newRevenue: number; }[], orderRef: any, newStatus: string) {
    for (const { productRef, newStock } of productUpdates) {
      transaction.update(productRef, { stock: newStock });
    }

    for (const { sellerRef, newSoldItems, newRevenue } of sellerUpdates) {
      transaction.update(sellerRef, {
        soldItemsNumber: newSoldItems,
        totalRevenue: newRevenue
      });
    }

    // Update order status
    transaction.update(orderRef, { status: newStatus });
  }

  private async setSellerUpdates(sellerChanges: Map<string, { soldItems: number; revenue: number; }>, transaction: Transaction) {
    const sellerUpdates: { sellerRef: any; newSoldItems: number; newRevenue: number; }[] = [];

    for (const [sellerId, changes] of sellerChanges) {
      const sellerRef = doc(this.fireStore, fireStoreCollections.users, sellerId);

      // READ seller (only once per seller!)
      const sellerData = (await transaction.get(sellerRef)).data() as Seller;

      sellerUpdates.push({
        sellerRef,
        newSoldItems: (sellerData.soldItemsNumber ?? 0) + changes.soldItems,
        newRevenue: (sellerData.totalRevenue ?? 0) + changes.revenue
      });
    }
    return sellerUpdates;
  }

  private async setProductAndSellerChanges(order: Order, transaction: Transaction, productUpdates: { productRef: any; newStock: number; }[], sellerChanges: Map<string, { soldItems: number; revenue: number; }>) {
    for (const item of order.items) {
      // Get product
      const productQuery = query(this.productCollectionRef, where('id', '==', item.id));
      const productSnap = await getDocs(productQuery);
      if (productSnap.empty) throw new Error(`Product ${item.id} not found`);

      const productDoc = productSnap.docs[0];
      const productRef = doc(this.fireStore, fireStoreCollections.products, productDoc.id);

      // READ product
      const productData = (await transaction.get(productRef)).data() as Product;

      // Validate stock
      if (productData.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${productData.name}`);
      }

      // Store product update
      productUpdates.push({
        productRef,
        newStock: productData.stock - item.quantity
      });

      // Accumulate seller changes
      const sellerId = productData.sellerId!;
      const current = sellerChanges.get(sellerId) || { soldItems: 0, revenue: 0 };
      current.soldItems += item.quantity;
      current.revenue += (item.quantity * item.price) * 0.9;
      sellerChanges.set(sellerId, current);
    }
  }

  getOrderById(id: string) {
    return from(
      getDocs(
        query(this.ordersCollectionRef, where('id', '==', id))
      )
    ).pipe(
      map((orders) => {
        let order = orders.docs[0].data() as Order;
        return order;
      }),
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return throwError(() => error);
      })
    )
  }

  isProductInPendingOrder(productId: string): Observable<boolean> {
    const sellerId = localStorage.getItem('token');
    if (!sellerId) return of(false);

    const q = query(
      this.ordersCollectionRef,
      where('status', '==', 'PENDING'),
      where('sellerId', '==', sellerId)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.some(doc => {
          const order = doc.data() as Order;
          return order.items?.some(item => item.id === productId) ?? false;
        });
      }),
      catchError(error => {
        this.firebaseErrorService.handleError(error);
        return of(false);
      })
    );
  }

  setStartDate(start: string) {
    this.startDate.set(start ?? '');
  }
  setEndDate(end: string) {
    this.endDate.set(end ?? '');
  }
  setStatus(status: string) {
    this.selectedStatus.set(status ?? 'All');
  }

  filterProducts() {
    let orders = localStorage.getItem('role') == 'admin' ? this.getAllOrders() : this.getMyOrders();

    return orders.pipe(
      map((orders) => {
        if (this.selectedStatus() != 'All') {
          orders = orders.filter((order) => order.status == this.selectedStatus())
        }
        if (this.startDate() != '') {
          orders = orders.filter((order) => normalizeDate(new Date(this.startDate())) >= new Date(order.orderDate!))
        }
        if (this.endDate() != '') {
          orders = orders.filter((order) => normalizeDate(new Date(this.endDate())) <= new Date(order.orderDate!))
        }

        return orders;
      }),
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return of([]);
      }),
    )
  }

  sortProducts(sortOption: string) {
    return this.filterProducts().pipe(
      map((orders) => {
        if (sortOption == 'newest') {
          orders = orders.sort((a, b) => {
            return Date.parse(b.orderDate!) - Date.parse(a.orderDate!);
          });
        } else if (sortOption == 'oldest') {
          orders = orders.sort((a, b) => {
            return Date.parse(a.orderDate!) - Date.parse(b.orderDate!);
          });
        } else if (sortOption == 'price-high') {
          orders = orders.sort((a, b) => {
            return b.totalPrice - a.totalPrice!;
          });
        } else if (sortOption == 'price-low') {
          orders = orders.sort((a, b) => {
            return a.totalPrice - b.totalPrice!;
          });
        }
        return orders;
      }),
      catchError((error) => {
        this.firebaseErrorService.handleError(error);
        return of([]);
      }),
    )
  }
}