import './styles.css';
import { createDemoApp } from './app/create-demo-app';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing #app root');

createDemoApp(root).catch((error) => {
  console.error(error);
  root.textContent = String(error);
});
