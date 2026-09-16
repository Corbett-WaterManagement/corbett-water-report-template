async function loadReport() {
  try {
    const siteResponse = await fetch("./data/index.json");
    const siteData = await siteResponse.json();

    console.log("Site control data:", siteData);

    const quarterResponse = await fetch(
      `./data/quarters/${siteData.currentPeriod}.json`
    );
    const quarterData = await quarterResponse.json();

    console.log("Current quarter data:", quarterData);
  } catch (error) {
    console.error("Unable to load report data:", error);
  }
}

loadReport();
