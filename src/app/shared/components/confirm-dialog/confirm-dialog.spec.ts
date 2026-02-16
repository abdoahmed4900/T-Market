import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ConfirmDialog } from "./confirm-dialog";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

describe('ConfirmDialogComponent',() => {
    let component : ConfirmDialog;
    let fixture : ComponentFixture<ConfirmDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule(
            {
                providers: [
                    { provide: MatDialogRef, useValue: {} },
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                ]
            }
        );
        fixture = TestBed.createComponent(ConfirmDialog);
        component = fixture.componentInstance;
    });

    it('should create component',() => {
        expect(component).toBeTruthy();
    })
})