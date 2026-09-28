import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>SafeMenu</h1>
        <p>
          Menús con alérgenos detectados automáticamente y publicados mediante un
          código QR.
        </p>
        <p className={styles.estado}>
          Fundación del proyecto iniciada. El panel del restaurante y el menú
          público se construirán en las siguientes tareas.
        </p>
      </main>
    </div>
  );
}
