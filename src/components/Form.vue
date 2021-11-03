<template>
	<div class="container">
		<h1>PDF calendar generator</h1>

		<form v-on:submit="onSubmit">
			<div class="mb-3">
				<label for="week" class="form-label">Select week to generate *</label>
				<input v-model="week" type="week" class="form-control rounded-0" id="week" required>
			</div>
			<div class="mb-3">
				<label for="property" class="form-label">Property of</label>
				<input v-model="property" type="text" class="form-control rounded-0" id="property">
			</div>
			<div class="d-grid gap-2">
				<button type="submit" class="btn btn-primary btn-lg rounded-0">Generate</button>
			</div>
		</form>
	</div>
</template>

<script>
import LocalStorageCache                 from "@raniel/local-storage-cache/LocalStorageCache";
import moment                            from "moment";
import download                          from "downloadjs";
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib'

moment.locale('en', {
	// months:                 'gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre'.split(' '),
	// monthsShort:            'gen feb mar apr mag giu lug ago set ott nov dic'.split(' '),
	// weekdays:               'domenica lunedì martedì mercoledì giovedì venerdì sabato'.split(' '),
	// weekdaysShort:          'dom lun mar mer gio ven sab'.split(' '),
	// weekdaysMin:            'do lu ma me gi ve sa'.split(' '),
	longDateFormat:         {
		LT:   'HH:mm',
		LTS:  'HH:mm:ss',
		L:    'DD/MM/YYYY',
		LL:   'D MMMM YYYY',
		LLL:  'D MMMM YYYY HH:mm',
		LLLL: 'dddd D MMMM YYYY HH:mm'
	},
	// calendar:               {
	// 	sameDay:  function () {
	// 		return (
	// 			'[Oggi a' +
	// 			(this.hours() > 1 ? 'lle ' : this.hours() === 0 ? ' ' : "ll'") +
	// 			']LT'
	// 		);
	// 	},
	// 	nextDay:  function () {
	// 		return (
	// 			'[Domani a' +
	// 			(this.hours() > 1 ? 'lle ' : this.hours() === 0 ? ' ' : "ll'") +
	// 			']LT'
	// 		);
	// 	},
	// 	nextWeek: function () {
	// 		return (
	// 			'dddd [a' +
	// 			(this.hours() > 1 ? 'lle ' : this.hours() === 0 ? ' ' : "ll'") +
	// 			']LT'
	// 		);
	// 	},
	// 	lastDay:  function () {
	// 		return (
	// 			'[Ieri a' +
	// 			(this.hours() > 1 ? 'lle ' : this.hours() === 0 ? ' ' : "ll'") +
	// 			']LT'
	// 		);
	// 	},
	// 	lastWeek: function () {
	// 		switch (this.day()) {
	// 			case 0:
	// 				return (
	// 					'[La scorsa] dddd [a' +
	// 					(this.hours() > 1
	// 						? 'lle '
	// 						: this.hours() === 0
	// 							? ' '
	// 							: "ll'") +
	// 					']LT'
	// 				);
	// 			default:
	// 				return (
	// 					'[Lo scorso] dddd [a' +
	// 					(this.hours() > 1
	// 						? 'lle '
	// 						: this.hours() === 0
	// 							? ' '
	// 							: "ll'") +
	// 					']LT'
	// 				);
	// 		}
	// 	},
	// 	sameElse: 'L'
	// },
	// relativeTime:           {
	// 	future: 'tra %s',
	// 	past:   '%s fa',
	// 	s:      'alcuni secondi',
	// 	ss:     '%d secondi',
	// 	m:      'un minuto',
	// 	mm:     '%d minuti',
	// 	h:      "un'ora",
	// 	hh:     '%d ore',
	// 	d:      'un giorno',
	// 	dd:     '%d giorni',
	// 	w:      'una settimana',
	// 	ww:     '%d settimane',
	// 	M:      'un mese',
	// 	MM:     '%d mesi',
	// 	y:      'un anno',
	// 	yy:     '%d anni'
	// },
	dayOfMonthOrdinalParse: /\d{1,2}º/,
	ordinal:                '%dº',
	week:                   {
		dow: 1, // Monday is the first day of the week.
		doy: 4 // The week that contains Jan 4th is the first week of the year.
	}
});

const IS_DEV            = process.env.NODE_ENV === 'development';
const localStorageCache = new LocalStorageCache();

export default {
	name: "Form",
	data() {
		return {
			week:     moment().year() + '-W' + moment().week(),
			property: localStorageCache.get('property') || ''
		};
	},
	methods: {
		onSubmit:              function (e) {
			e.preventDefault();

			// get first and last days of selected week
			const weekInfo   = this.week.split('-');
			const year       = parseInt(weekInfo[0]);
			const week       = parseInt(weekInfo[1].split('W').join(''));
			let startDate    = moment().year(year).week(week).startOf('week');
			const endDate    = moment().year(year).week(week).endOf('week');
			const startMonth = startDate.format('MMMM').toLowerCase().trim();
			const endMonth   = endDate.format('MMMM').toLowerCase().trim();

			// get all dates of the week
			let dates = [];
			while (startDate.format('YYYYMMDD') !== endDate.format('YYYYMMDD')) {
				dates.push(startDate.format('DD'));
				startDate = startDate.add(1, 'days');
			}
			dates.push(endDate.format('DD'));

			this.createPdf(dates, year, startMonth, endMonth, week);
		},
		createPdf:             async function (dates, year, startMonth, endMonth, week) {
			// Fetch an existing PDF document
			const basePdfUrl       = location.href.split('index.html').join('') + '/base.pdf';
			const existingPdfBytes = await fetch(basePdfUrl).then(res => res.arrayBuffer());

			// Load a PDFDocument from the existing PDF bytes
			const pdfDoc = await PDFDocument.load(existingPdfBytes);

			pdfDoc.setTitle('Calendario settimana ' + week + ' anno ' + year);
			pdfDoc.setSubject('Calendario settimana ' + week + ' anno ' + year);
			pdfDoc.setAuthor(this.property || 'Daniele Sabre');
			pdfDoc.setProducer('Generatore calendario Lary by Daniele Sabre');
			pdfDoc.setKeywords(['calendario', this.week]);
			pdfDoc.setCreationDate(new Date());
			pdfDoc.setModificationDate(new Date());

			// Get the first page of the document
			const pages     = pdfDoc.getPages();
			const firstPage = pages[0];

			// cancel lines using rectangles
			this.pdfDrawRectangles(firstPage);

			// write texts
			await this.pdfDrawTexts(pdfDoc, firstPage, year, startMonth, endMonth, week, dates);

			// Serialize the PDFDocument to bytes (a Uint8Array)
			const pdfBytes = await pdfDoc.save();

			// Trigger the browser to download the PDF document
			download(pdfBytes, this.week + '.pdf', 'application/pdf');
		},
		pdfDrawTexts:          async function (pdfDoc, page, year, startMonth, endMonth, week, dates) {
			let month = startMonth.toLowerCase();
			// if (startMonth !== endMonth) {
			// 	month = [startMonth, endMonth].join('/').toLowerCase();
			// }

			// Embed the Helvetica font
			const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
			const texts         = [
				{
					x:    65,
					y:    570.2,
					size: 12,
					text: year + ''
				},
				{
					x:    156,
					y:    570.2,
					size: 12,
					text: month
				},
				{
					x:    289,
					y:    570.2,
					size: 12,
					text: week + ''
				}
			];

			dates.forEach((date, index) => {
				let x = 0;
				switch (index) {
					case 0:
						x = 108;
						break;
					case 1:
						x = 221;
						break;
					case 2:
						x = 344;
						break;
					case 3:
						x = 452;
						break;
					case 4:
						x = 556;
						break;
					case 5:
						x = 680;
						break;
					case 6:
						x = 787;
						break;
				}

				texts.push({
					x:    x,
					y:    551,
					size: 12,
					text: date
				});
			});

			// add property only if it is defined
			if (this.property.trim() !== '') {
				const property = this.property.toLowerCase().split(' ').map(s => this.capitalizeFirstLetter(s)).join(' ');

				localStorageCache.set('property', property);

				texts.push({
					x:    734,
					y:    570.2,
					size: 12,
					text: property
				});
			}

			texts.forEach(options => {
				options.font  = helveticaFont;
				options.color = rgb(0.3, 0.3, 0.3);

				const text = options.text;

				page.drawText(text, options);
			});
		},
		pdfDrawRectangles:     function (page) {
			let rectanglesColor   = rgb(1, 1, 1);
			let rectanglesOpacity = 1;

			if (IS_DEV) {
				rectanglesColor   = rgb(1, 0, 0);
				rectanglesOpacity = 0.5;
			}

			const rectangles = [
				{
					x:      56,
					y:      567,
					width:  50,
					height: 5
				},
				{
					x:      151,
					y:      567,
					width:  87,
					height: 5
				},
				{
					x:      287,
					y:      567,
					width:  30,
					height: 5
				},
				{
					x:      103,
					y:      547,
					width:  30,
					height: 5
				},
				{
					x:      216,
					y:      547,
					width:  30,
					height: 5
				},
				{
					x:      339,
					y:      547,
					width:  30,
					height: 5
				},
				{
					x:      447,
					y:      547,
					width:  30,
					height: 5
				},
				{
					x:      551,
					y:      547,
					width:  30,
					height: 5
				},
				{
					x:      675,
					y:      547,
					width:  30,
					height: 5
				},
				{
					x:      782,
					y:      547,
					width:  30,
					height: 5
				}
			];

			// add rectangle for property only if property is already defined
			if (this.property.trim() !== '') {
				rectangles.push({
					x:      729,
					y:      567,
					width:  105,
					height: 5
				});
			}

			rectangles.forEach(options => {
				options.color   = rectanglesColor;
				options.opacity = rectanglesOpacity;

				page.drawRectangle(options);
			});
		},
		capitalizeFirstLetter: function (string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
	}
}
</script>

<style scoped>

</style>
