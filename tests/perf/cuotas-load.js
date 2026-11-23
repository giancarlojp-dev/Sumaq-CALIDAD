import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  vus: 50,
  duration: "15s",
  thresholds: {
    http_req_duration: ["avg<=1500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/cuotas?pagina=1&limite=20`);
  check(res, {
    "status es 200": (r) => r.status === 200,
    "tiene arreglo datos": (r) => {
      try {
        const body = r.json();
        return Array.isArray(body.datos);
      } catch {
        return false;
      }
    },
  });
  sleep(0.2);
}
