import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RegisterComponent } from "./register";
import { AuthService } from "../../../core/services/auth.service";
import { Firestore } from "@angular/fire/firestore";
import { provideRouter } from "@angular/router";

describe('RegisterComponent',() => {

    let registerComponent : RegisterComponent;
    let registerFixture : ComponentFixture<RegisterComponent>;
    let firestoreMock = {
        collection : jasmine.createSpy(),
        doc : jasmine.createSpy(),
    }
    let authMock = {
        register : jasmine.createSpy().and.returnValue(true),
    }

    beforeEach(async () =>  {
        await TestBed.configureTestingModule(
            {
                providers: [
                    {provide : AuthService , useValue : authMock},
                    {provide : Firestore , useValue: firestoreMock},
                    provideRouter([])
                ]
            }
        ).compileComponents();
        registerFixture = TestBed.createComponent(RegisterComponent);
        registerComponent = registerFixture.componentInstance;
        registerFixture.detectChanges();
    })

    it('should create component',() => {
        expect(registerComponent).toBeTruthy()
    })

    it('try form with invalid name',() => {
        registerComponent.registerForm.setValue({name: '',email: 'a@b.co',password: '123456',confirmPassword: '123456'})
        registerComponent.register();
        expect(authMock.register).not.toHaveBeenCalled();
    });
    it('try form with invalid email',() => {
        registerComponent.registerForm.setValue({name: 'abdo',email: '',password: '123456',confirmPassword: '123456'})
        registerComponent.register();
        expect(authMock.register).not.toHaveBeenCalled();
    });
    it('try form with invalid password',() => {
        registerComponent.registerForm.setValue({name: 'abdo',email: 'a@b.co',password: '',confirmPassword: '123456'})
        registerComponent.register();
        expect(authMock.register).not.toHaveBeenCalled();
    });
    it('try form with invalid confirm password',() => {
        registerComponent.registerForm.setValue({name: 'abdo',email: 'a@b.co',password: '123456',confirmPassword: ''})
        registerComponent.register();
        expect(authMock.register).not.toHaveBeenCalled();
    });

});