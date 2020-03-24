const csv=require('csvtojson')
const fetch = require('node-fetch')
const fs = require('fs')



const csvExt = '.csv'
const jsonExt = '.json'
const urls = {
	'daily_report': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/', 
	'time_series_confirmed': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv', 
	'time_series_deaths': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv', 
	'time_series_recovered': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv', 
	'time_series_deaths_global': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv', 
	'time_series_confirmed_global': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', 
	'who_time_series': 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/who_covid_19_situation_reports/who_covid_19_sit_rep_time_series/who_covid_19_sit_rep_time_series.csv'
}

// TODO: make keys consistent with 03-23-2020 update
// const keys = {
// 	'province_state': 'Province_State', 
// 	'country_region': 'Country_Region', 
// 	'lat': 'Lat', 
// 	'long': 'Long_', 
// }

// hours*minutes*seconds*milliseconds
const oneDay = 24 * 60 * 60 * 1000; 
// First daily report
const firstReportDate = new Date(2020, 0, 22)

async function main() {
	// Number of daily reports
	const mostRecentUploadDate = await dateAvailable()
	// Days since first report
	const daysCount = diffDays(firstReportDate, mostRecentUploadDate, oneDay)
	let date = new Date(firstReportDate.setDate(firstReportDate.getDate() - 1))
	let data = []
	for (let j = 0; j < daysCount + 1; j++) {
		date = new Date(date.setDate(date.getDate() + 1))
		const dateStr = getDateString(date)
		const csvFile = dateStr + csvExt
		const jsonFile = dateStr + jsonExt
		writeToFile(urls['daily_report'], './csse_covid_19_data/csse_covid_19_daily_reports_json/', csvFile, jsonFile)
	}

	// convert time series
	writeToFile(urls['time_series_confirmed'], './csse_covid_19_data/csse_covid_19_time_series_json/', '', 'time_series_19-covid-Confirmed.json')
	writeToFile(urls['time_series_deaths'], './csse_covid_19_data/csse_covid_19_time_series_json/', '', 'time_series_19-covid-Deaths.json')
	writeToFile(urls['time_series_recovered'], './csse_covid_19_data/csse_covid_19_time_series_json/', '', 'time_series_19-covid-Recovered.json')
	writeToFile(urls['time_series_confirmed_global'], './csse_covid_19_data/csse_covid_19_time_series_json/', '', 'time_series_covid19_confirmed_global.json')
	writeToFile(urls['time_series_deaths_global'], './csse_covid_19_data/csse_covid_19_time_series_json/', '', 'time_series_covid19_deaths_global.json')
	
	// // convert who time series
	writeToFile(urls['who_time_series'], './who_covid_19_situation_reports/who_covid_19_sit_rep_time_series/', '', 'who_covid_19_sit_rep_time_series.json')
}

async function writeToFile(url, folderPath, csvFile, jsonFile) {
	const csvStr = await getData(url, csvFile)
	const json = await convertCSVtoJson(csvStr)
	fs.writeFile(folderPath + jsonFile, JSON.stringify(json, null, 4), err => {
		if (err) throw err; 
		return; 
	})
}

async function getData(url, filename) {
	const response = await fetch(url + filename, {
		method: 'GET'
	})
	return response.text()
}

// return date for which most recent data is available (today or yesterday)
async function dateAvailable() {
	let date = new Date()
	const todayDateStr = getDateString(new Date())
	const response = await fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + todayDateStr + '.csv', {
		method: 'GET'
	})
	if (response.status === 404) {
		return date.setDate(date.getDate() - 1)
	} else {
		return date
	}
}

async function convertCSVtoJson(csvData) {
  var data = []
  await csv().fromString(csvData).subscribe((json) => {
    data.push(json)
  })
  return data
}

function getDateString(date) {
	const year = date.getFullYear();
	const month = (1 + date.getMonth()).toString().padStart(2, '0');
	const day = (date.getDate()).toString().padStart(2, '0');
	return month + '-' + day + '-' + year
}

function getDateObject(string) {
	const parts = string.split('-')
	return new Date(parts[2], parts[0] - 1, parts[1])
}

function diffDays(firstDate, secondDate, oneDay) {
	return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

main()
