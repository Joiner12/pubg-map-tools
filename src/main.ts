import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/components/router/router";

import "./assets/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router).mount("#app");
