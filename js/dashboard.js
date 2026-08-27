/* =========================================================
   DASHBOARD VERIFIKASI TANAM 2024
   ========================================================= */


/* =========================================================
   VARIABEL CHART
   ========================================================= */

let statusChart = null;
let bibitChart = null;


/* =========================================================
   MENGAMBIL DATA TITIK
   ========================================================= */

function getFeatures() {

    if (
        typeof json_TitikVerifikasiTanam2024_2 === "undefined"
    ) {
        console.error(
            "Data TitikVerifikasiTanam2024_2 tidak ditemukan."
        );

        return [];
    }

    return json_TitikVerifikasiTanam2024_2.features || [];
}


/* =========================================================
   MEMBACA FIELD
   ========================================================= */

function getField(feature, field) {

    if (
        !feature ||
        !feature.properties
    ) {
        return "";
    }

    const value =
        feature.properties[field];

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toUpperCase();
}


/* =========================================================
   STATUS TANAMAN
   =========================================================

   ATURAN DATA AKTUAL:

   HIDUP:
   Hidup = V
   Mati  = X

   MATI:
   Hidup = X
   Mati  = V

   LAINNYA:
   Tidak Tertanam
   ========================================================= */

function getStatus(feature) {

    const nilaiHidup =
        getField(feature, "Hidup");

    const nilaiMati =
        getField(feature, "Mati");


    /* =========================
       TANAMAN HIDUP
       ========================= */

    if (
        nilaiHidup === "V" &&
        nilaiMati === "X"
    ) {
        return "Hidup";
    }


    /* =========================
       TANAMAN MATI
       ========================= */

    if (
        nilaiHidup === "X" &&
        nilaiMati === "V"
    ) {
        return "Mati";
    }


    /* =========================
       TIDAK TERTANAM
       ========================= */

    return "Tidak Tertanam";
}


/* =========================================================
   FILTER DATA
   ========================================================= */

function getFilteredFeatures() {

    const blokSelect =
        document.getElementById("filterBlok");

    const timSelect =
        document.getElementById("filterTim");


    const blok =
        blokSelect
            ? blokSelect.value
            : "ALL";

    const tim =
        timSelect
            ? timSelect.value
            : "ALL";


    return getFeatures().filter(function(feature) {

        const blokData =
            getField(feature, "Blok");

        const timData =
            getField(feature, "Tim");


        const cocokBlok =
            blok === "ALL" ||
            blokData === blok;


        const cocokTim =
            tim === "ALL" ||
            timData === tim;


        return cocokBlok && cocokTim;

    });
}


/* =========================================================
   HITUNG STATISTIK
   ========================================================= */

function calculateStatistics(features) {

    let hidup = 0;
    let mati = 0;
    let tidak = 0;


    features.forEach(function(feature) {

        const status =
            getStatus(feature);


        if (status === "Hidup") {

            hidup++;

        }
        else if (status === "Mati") {

            mati++;

        }
        else {

            tidak++;

        }

    });


    return {

        total: features.length,

        hidup: hidup,

        mati: mati,

        tidak: tidak

    };
}


/* =========================================================
   FORMAT ANGKA
   ========================================================= */

function formatNumber(number) {

    return Number(number)
        .toLocaleString("id-ID");
}


/* =========================================================
   FORMAT PERSENTASE
   ========================================================= */

function formatPercentage(value) {

    return Number(value)
        .toFixed(2)
        .replace(".", ",") + "%";
}


/* =========================================================
   UPDATE KARTU STATISTIK
   ========================================================= */

function updateCards(stats) {

    const total =
        stats.total;


    const persenHidup =
        total > 0
            ? (stats.hidup / total) * 100
            : 0;


    const persenMati =
        total > 0
            ? (stats.mati / total) * 100
            : 0;


    const persenTidak =
        total > 0
            ? (stats.tidak / total) * 100
            : 0;


    document.getElementById(
        "totalTitik"
    ).textContent =
        formatNumber(stats.total);


    document.getElementById(
        "totalHidup"
    ).textContent =
        formatNumber(stats.hidup);


    document.getElementById(
        "totalMati"
    ).textContent =
        formatNumber(stats.mati);


    document.getElementById(
        "totalTidak"
    ).textContent =
        formatNumber(stats.tidak);


    document.getElementById(
        "persenHidup"
    ).textContent =
        formatPercentage(persenHidup);


    document.getElementById(
        "persenMati"
    ).textContent =
        formatPercentage(persenMati);


    document.getElementById(
        "persenTidak"
    ).textContent =
        formatPercentage(persenTidak);


    document.getElementById(
        "successPercentage"
    ).textContent =
        formatPercentage(persenHidup);


    document.getElementById(
        "successProgress"
    ).style.width =
        persenHidup + "%";
}


/* =========================================================
   PIE CHART STATUS
   ========================================================= */

function updateStatusChart(stats) {

    const canvas =
        document.getElementById(
            "statusChart"
        );


    if (!canvas) {
        return;
    }


    if (statusChart) {

        statusChart.destroy();

    }


    statusChart =
        new Chart(canvas, {

            type: "pie",

            data: {

                labels: [
                    "Hidup",
                    "Mati",
                    "Tidak Tertanam"
                ],

                datasets: [{

                    data: [
                        stats.hidup,
                        stats.mati,
                        stats.tidak
                    ],

                    backgroundColor: [
                        "#35a853",
                        "#dc2626",
                        "#eab308"
                    ],

                    borderColor: "#ffffff",

                    borderWidth: 2

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    },

                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                const total =
                                    context.dataset.data
                                    .reduce(
                                        (a, b) => a + b,
                                        0
                                    );

                                const value =
                                    context.raw;

                                const persen =
                                    total > 0
                                        ? (
                                            value /
                                            total *
                                            100
                                        ).toFixed(2)
                                        : 0;

                                return (
                                    context.label +
                                    ": " +
                                    formatNumber(value) +
                                    " (" +
                                    persen +
                                    "%)"
                                );

                            }

                        }

                    }

                }

            }

        });
}


/* =========================================================
   GRAFIK JENIS BIBIT YANG BERTAHAN
   ========================================================= */

function updateBibitChart(features) {

    const data = {};


    features.forEach(function(feature) {

        /* HANYA TANAMAN HIDUP */

        if (
            getStatus(feature) !==
            "Hidup"
        ) {
            return;
        }


        const jenis =
            getField(feature, "Jenis_Bibi");


        if (!jenis) {
            return;
        }


        if (
            !data[jenis]
        ) {
            data[jenis] = 0;
        }


        data[jenis]++;

    });


    /* Urutkan dari jumlah terbesar */

    const sorted =
        Object.entries(data)
        .sort(function(a, b) {

            return b[1] - a[1];

        })
        .slice(0, 9);


    const labels =
        sorted.map(function(item) {

            return item[0];

        });


    const values =
        sorted.map(function(item) {

            return item[1];

        });


    const canvas =
        document.getElementById(
            "bibitChart"
        );


    if (!canvas) {
        return;
    }


    if (bibitChart) {

        bibitChart.destroy();

    }


    bibitChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [{

                    label: "Jumlah Hidup",

                    data: values,

                    backgroundColor:
                        "#35a853",

                    borderRadius: 5

                }]

            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                },

                scales: {

                    x: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        });
}


/* =========================================================
   MEMBUAT FILTER BLOK DAN TIM
   ========================================================= */

function populateFilters() {

    const features =
        getFeatures();


    const blokSet =
        new Set();


    const timSet =
        new Set();


    features.forEach(function(feature) {

        const blok =
            getField(feature, "Blok");

        const tim =
            getField(feature, "Tim");


        if (blok) {

            blokSet.add(blok);

        }


        if (tim) {

            timSet.add(tim);

        }

    });


    const filterBlok =
        document.getElementById(
            "filterBlok"
        );


    const filterTim =
        document.getElementById(
            "filterTim"
        );


    Array.from(blokSet)
        .sort()
        .forEach(function(blok) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                blok;

            option.textContent =
                blok;

            filterBlok.appendChild(
                option
            );

        });


    Array.from(timSet)
        .sort()
        .forEach(function(tim) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                tim;

            option.textContent =
                tim;

            filterTim.appendChild(
                option
            );

        });
}


/* =========================================================
   TABEL RINGKASAN PER BLOK
   ========================================================= */

function updateTable(features) {

    const groups = {};


    features.forEach(function(feature) {

        const blok =
            getField(feature, "Blok") ||
            "Tidak Diketahui";


        if (!groups[blok]) {

            groups[blok] = {

                total: 0,

                hidup: 0,

                mati: 0,

                tidak: 0

            };

        }


        groups[blok].total++;


        const status =
            getStatus(feature);


        if (status === "Hidup") {

            groups[blok].hidup++;

        }
        else if (status === "Mati") {

            groups[blok].mati++;

        }
        else {

            groups[blok].tidak++;

        }

    });


    const tbody =
        document.getElementById(
            "tableBlok"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    Object.keys(groups)
        .sort()
        .forEach(function(blok) {

            const data =
                groups[blok];


            const persen =
                data.total > 0
                    ? (
                        data.hidup /
                        data.total *
                        100
                    )
                    : 0;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>${blok}</td>

                <td>
                    ${formatNumber(data.total)}
                </td>

                <td>
                    ${formatNumber(data.hidup)}
                </td>

                <td>
                    ${formatNumber(data.mati)}
                </td>

                <td>
                    ${formatNumber(data.tidak)}
                </td>

                <td class="persen-cell">

                    <div class="persen-wrapper">

                        <div class="persen-bar">

                            <div
                                class="persen-fill"
                                style="width:${persen}%"
                            ></div>

                        </div>

                        <span>
                            ${formatPercentage(persen)}
                        </span>

                    </div>

                </td>

            `;


            tbody.appendChild(row);

        });
}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

function updateDashboard() {

    const features =
        getFilteredFeatures();


    const stats =
        calculateStatistics(
            features
        );


    updateCards(stats);

    updateStatusChart(stats);

    updateBibitChart(features);

    updateTable(features);
}


/* =========================================================
   EVENT FILTER
   ========================================================= */

function activateFilters() {

    const filterBlok =
        document.getElementById(
            "filterBlok"
        );


    const filterTim =
        document.getElementById(
            "filterTim"
        );


    if (filterBlok) {

        filterBlok.addEventListener(
            "change",
            updateDashboard
        );

    }


    if (filterTim) {

        filterTim.addEventListener(
            "change",
            updateDashboard
        );

    }
}


/* =========================================================
   MULAI DASHBOARD
   ========================================================= */

function startDashboard() {

    populateFilters();

    activateFilters();

    updateDashboard();
}


/* =========================================================
   MENUNGGU HALAMAN SELESAI
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startDashboard
    );

}
else {

    startDashboard();

}
