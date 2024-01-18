const dataUrl = "json_dumps/charts.json"
d3.json(dataUrl, function (data) {
    const relChartData = Object.values(data.religions)
    // Create the religions chart
    const religionsChart = Highcharts.chart('container religion_chart', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Religion'
        },
        tooltip: {
            valueSuffix: '%'
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                }
            }
        },
        series: [
            {
                name: 'Percentage',
                colorByPoint: true,
                data: relChartData
            }
        ]
    });   
    // Create categories chart
    const catChartData= Object.values(data.categories)
    const drilldownData = Object.values(data.categories_drilldown)
    console.log(catChartData)
    Highcharts.chart('container', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Good Categories'
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                }
            }
        },
        series: [
            {
                name: 'Mentioned in',
                colorByPoint: true,
                data: catChartData
            }
        ],
        drilldown:{
            series: drilldownData
        }
    })
  })