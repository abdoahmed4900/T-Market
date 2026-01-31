import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResetPassword } from "./reset-password";
import { AuthService } from "../auth.service";
import { of } from "rxjs";

describe('ResetPassword',() => {

    let component : ResetPassword;
    let componentFixure : ComponentFixture<ResetPassword>;
    let authServiceMock = {
        resetPassword: jasmine.createSpy('resetPassword').and.returnValue(of({ email: 'ab@m.com'})),
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers : [
                { provide: AuthService, useValue: authServiceMock}
            ]
        }).compileComponents();
        componentFixure = TestBed.createComponent(ResetPassword);
        component = componentFixure.componentInstance;
        authServiceMock.resetPassword.calls.reset();
        componentFixure.detectChanges();
    });

    it('should create component',() => {
        expect(component).toBeTruthy();
    })

    it('reset password method should be valid',() => {
        component.resetPasswordFirstForm.setValue({email: 'abd@m.com'})
        component.resetPassword();
        expect(authServiceMock.resetPassword).toHaveBeenCalled();
    })
    it('reset password method should be invalid',() => {
        component.resetPasswordFirstForm.setValue({email: ''})
        component.resetPassword();
        expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
    })
})