import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LoginComponent } from "./login";
import { Firestore } from "@angular/fire/firestore";
import { AuthService } from "../../../core/services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const firestoreMock = {
    collection: jasmine.createSpy(),
    doc: jasmine.createSpy(),
  };
  const authServiceMock = {
    loginWithEmailAndPassword: jasmine.createSpy().and.returnValue({
      subscribe : ({next} : any) => {
        next({
          email : 'abdo2@moakt.co',
          password: '123456', 
        })
        return {unsubscribe(){}};
      }
    }),

    loginWithGoogle: jasmine.createSpy().and.returnValue(
      {
        subscribe : ({next} : any) => {
        next({
          user: {
            email : 'abdo2@moakt.co',
            displayName: 'sasasa', 
            uid: 'sasaa',
          }
        })
        return {unsubscribe(){}};
      }
    }
    )
  }

  const routerMock = {
    navigate: jasmine.createSpy().and.returnValue(true),
    createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
    navigateByUrl: jasmine.createSpy('navigateByUrl').and.returnValue(true),
    serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue(true),
    events: of(),
  }


  const activatedRouteMock = {
    snapshot: { queryParams: {} },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers : [
        { provide: Firestore, useValue: firestoreMock },
        { provide: AuthService, useValue: authServiceMock},
        { provide: Router , useValue : routerMock},
        { provide: ActivatedRoute , useValue : activatedRouteMock},
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('try login method with no email and no password (invalid)',() => {
    component.loginForm.setValue({email:'', password : ''})
    component.loginWithEmailAndPassword();
    expect(authServiceMock.loginWithEmailAndPassword).not.toHaveBeenCalledWith()
  })

  it('try login method with email and no password (invalid)',() => {
    component.loginForm.setValue({email:'a@r.com', password : ''})
    component.loginWithEmailAndPassword();
    expect(authServiceMock.loginWithEmailAndPassword).not.toHaveBeenCalledWith()
  })

  it('try login method with no email and password (invalid)',() => {
    component.loginForm.setValue({email:'', password : '123456'})
    component.loginWithEmailAndPassword();
    expect(authServiceMock.loginWithEmailAndPassword).not.toHaveBeenCalledWith()
  })
});
