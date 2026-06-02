import './styles.css';
import { createApp } from './app/App';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing #app root');

createApp(root).catch((error) => {
  console.error(error);
  root.textContent = String(error);
});
