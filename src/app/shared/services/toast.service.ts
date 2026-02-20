import { Injectable } from "@angular/core";
// import { MessageService } from "primeng/api";

@Injectable(
    {
        providedIn: 'root',
        deps: [
        //   MessageService,
        ] 
    }
)
export class ToastService{
    // messageService = inject(MessageService);

    // showErrorToast(message:string,title?:string){
    //     this.messageService.add(
    //         {
    //             severity: 'error',
    //             summary: title ?? 'Error',
    //             detail: message,
    //             key: 'tr',
    //             life: 3000
    //         }
    //     )
    // }
    // showSuccessToast(message:string,title?:string){
    //     this.messageService.add(
    //         {
    //             severity: 'success',
    //             summary: title ?? 'success',
    //             detail: message,
    //             key: 'tr',
    //             life: 3000
    //         }
    //     )
    // }
}