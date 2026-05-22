import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faInfoCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule, FaIconComponent, MatDialogModule],
  templateUrl: 'confirm-dialog.html',
  styleUrl: 'confirm-dialog.scss',
})
export class ConfirmationDialogComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: 'warning' | 'danger' | 'info' = 'warning';
  @Input() confirmText: string = '';
  @Input() cancelText: string = '';

  @Output() confirm = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<boolean>();
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  getIcon() {
    switch (this.type) {
      case 'danger':
        return faTrashAlt;
      case 'info':
        return faInfoCircle;
      default:
        return faExclamationTriangle;
    }
  }

  onConfirm() {
    this.confirm.emit(true);
  }

  onCancel() {
    this.cancel.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.onCancel();
    }
  }
}