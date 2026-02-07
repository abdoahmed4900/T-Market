import { CartService } from "./cart.service";
import { TestBed } from "@angular/core/testing";
import { toSignal } from '@angular/core/rxjs-interop';
import * as firestore from '@angular/fire/firestore';
import { of } from "rxjs";
import { ProductsService } from "./products.service";



class FakeCollectionRef {}
class FakeDocRef {}

describe('CartService',() => {
    let service: CartService;
    let productServiceMock = {
        getProductById: jasmine.createSpy('getProductById').and.returnValue(of({
            id: '1',
            name: 'Apple 15 pro',
            description: 'All oo phone',
            stock: 25,
            imageUrls: [],
            price: 250,
            category: 'Phones',
            brand: 'Apple',
            rating: 4.5,
            reviews: [],
        }))
    };
    let firestoreMockup = {
        collection: jasmine.createSpy().and.callFake((doc:any,name:string) => {
            return new FakeCollectionRef();
        }),
        collectionData: jasmine.createSpy().and.returnValue(of([
              {
                        id: 1, 
                        name: 'abdo', 
                        cartProducts: [ 
                            { id: '1', price: 120, quantity: 3, name: 'IPhone 17 pro max'},
                            { id: '2', price: 300, quantity: 5, name: 'Apple Macbook M1'},
                            { id: '3', price: 550, quantity: 2, name: 'Samsung s24 ultra'},
                        ],
                        role: 'Buyer',
                        createdAt: '20-01-2015',
                        email: 'ab@moka.co',
                        ordersIds: [
                            'pk.123',
                            'pk.453',
                            'pk.678',
                        ],
                        wishListIds: [
                            'pk.123',
                            'pk.453',
                            'pk.678',
                        ],
                    }
        ])
       ),
       doc: jasmine.createSpy().and.callFake((fs: any, collectionName: string, id: string) => {
         return new FakeDocRef();
       }),
       query: jasmine.createSpy().and.callFake((q) => {
         return q;
       }),
       where: jasmine.createSpy().and.callFake((field: string, op: any, value: any) => {
         return { field, op, value };
       }),
       getDoc: jasmine.createSpy().and.resolveTo(() => {
        return {
            data: () => ({ cartProducts : []})
        };
       }),
       updateDoc: jasmine.createSpy().and.resolveTo(() => {
        return {};
       })
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule(
            {
                providers: [
                     CartService,
                    { provide: firestore.Firestore, useValue: firestoreMockup },
                    { provide: ProductsService, useValue: productServiceMock },
                ]
            }
        )   
        service = TestBed.inject(CartService);      
    });

    it('should get all cart products',() => {
        let products = toSignal(service.getAllCartProducts());
        expect(products.length).toBe(3)
    })
})