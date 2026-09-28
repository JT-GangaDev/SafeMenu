import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>SafeMenu</h1>
        <p>
          MenÃºs con alÃ©rgenos detectados automÃ¡ticamente y publicados mediante un
          cÃ³digo QR.
        </p>
        <p className={styles.estado}>
          FundaciÃ³n del proyecto iniciada. El panel del restaurante y el menÃº
          pÃºblico se construirÃ¡n en las siguientes tareas.
        </p>
      </main>
    </div>
  );
}
