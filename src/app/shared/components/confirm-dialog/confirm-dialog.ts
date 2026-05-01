import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  confirmFunction! : () => Promise<void>;
  dialogTitle! : string;

   constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<ConfirmDialog>
  ) {
    this.dialogTitle = data.dialogTitle;
    this.confirmFunction = data.confirmFunction;
  }

  onCancel() {
    this.dialogRef.close();
  }

  async onConfirm() {
    console.log(this.confirmFunction);
    console.log(this.dialogTitle);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      await this.confirmFunction();
     } catch (err) {
       console.error('Confirm function failed:', err);
     } finally {
       this.dialogRef.close();
    }
  }

}
