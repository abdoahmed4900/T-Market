import { Injectable } from "@angular/core";
import { Chart } from "chart.js";

@Injectable({ providedIn: 'root' })
export class ChartFactory {
  createChart(item: any, config: any) {
    return new Chart(item, config);
  }
}