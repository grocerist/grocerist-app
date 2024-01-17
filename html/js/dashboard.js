const dataUrl = "json_dumps/charts.json"
d3.json(dataUrl, function (data) {
    chartData = Object.values(data)
    // Create the chart
    const chart = Highcharts.chart('container', {
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
                dataLabels: [{
                    enabled: true,
                    distance: 20
                }, {
                    enabled: true,
                    distance: -40,
                    format: '{point.percentage:.1f}%',
                    style: {
                        fontSize: '1.2em',
                        textOutline: 'none',
                        opacity: 0.7
                    },
                    filter: {
                        operator: '>',
                        property: 'percentage',
                        value: 10
                    }
                }]
            }
        },
        series: [
            {
                name: 'Percentage',
                colorByPoint: true,
                data: chartData
            }
        ]
    });   
  })