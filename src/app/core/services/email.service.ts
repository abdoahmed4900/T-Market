import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable(
    {
        providedIn: 'root'
    }
)
export class EmailService{

    httpService = inject(HttpClient);

    async sendEmail(name:string,message:string,email:string){
         this.httpService.post('http://localhost:4242/api/send-email',{
            name: name,
            message: message,
            email: email,
        }).subscribe(
            {
                next : (value) =>{
                    console.log(JSON.stringify(value));   
                },
            }
        )
    }
}