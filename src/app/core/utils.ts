import { AbstractControl } from "@angular/forms";

export let statusChartOptions : any = (pending : number,shipped: number,delivered : number,cancelled : number) => {
    return {
        type: 'bar',
        data: {
        labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        datasets: [{
        label: 'Order Status Count',
        data: [
          pending,
          shipped,
          delivered,
          cancelled
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10,
            color: '#000000'
          }
        },
        x: {
          ticks: {
            color: '#000000'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#000000'
          }
        },
        title: {
          display: true,
          text: 'Monthly Order Status',
          color: '#000000'
        }
      }
    }
    }
  };

  export let pieChartOptions : any = (pending : number,shipped: number,delivered : number,cancelled : number) => {
    return {
        type: 'pie',
    data: {
      labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [{
        label: 'Order Status Distribution',
        data: [
          pending,
          shipped,
          delivered,
          cancelled
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#000000'
          }
        },
        title: {
          display: true,
          text: 'Order Status Distribution',
          color: '#000000'
        }
      }
    }
    }
  };

  export function numericLengthValidator(minLength: number) {
       return (control: AbstractControl) => {
       const value = control.value?.toString() || '';
       console.log(`value.length < minLength : ${value.length < minLength}`);
       
       return value.length < minLength && value.length > 0 ? { minlength: true } : null;
      };
  }