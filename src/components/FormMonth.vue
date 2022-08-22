<template>
    <form v-on:submit="onSubmit">
        <div class="mb-3">
            <label for="month" class="form-label">Seleziona il mese da generare *</label>
            <input v-model="month" type="month" class="form-control rounded-0" id="month" required>
        </div>
        <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary btn-lg rounded-0">Genera planner mensile</button>
        </div>
    </form>
</template>

<script>
import moment                            from "moment";
import download                          from "downloadjs";
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib'

moment.locale('en', {
    months:      'gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre'.split(' '),
    monthsShort: 'gen feb mar apr mag giu lug ago set ott nov dic'.split(' '),
    // weekdays:               'domenica lunedì martedì mercoledì giovedì venerdì sabato'.split(' '),
    // weekdaysShort:          'dom lun mar mer gio ven sab'.split(' '),
    // weekdaysMin:            'do lu ma me gi ve sa'.split(' '),
    longDateFormat: {
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

const IS_DEV = process.env.NODE_ENV === 'development';
// const IS_DEV = false;

export default {
    name: "FormMonth",
    data() {
        return {
            month: moment().format('YYYY-MM')
        };
    },
    methods: {
        onSubmit:              function (e) {
            e.preventDefault();

            const date    = this.month.split('-').map(i => parseInt(i));
            let startDate = moment().year(date[0]).month(date[1] - 1).startOf('month');
            let endDate   = moment().year(date[0]).month(date[1] - 1).endOf('month');

            // set start date to monday of the same week of 1st day of this month
            while (parseInt(startDate.format('d')) !== 1) {
                startDate = startDate.subtract(1, 'days');
            }

            // set end date to sunday of the same week of last day of this month
            while (parseInt(endDate.format('d')) !== 0) {
                endDate = endDate.add(1, 'days');
            }

            // get all dates to show
            let dates = [];
            while (startDate.format('YYYYMMDD') !== endDate.format('YYYYMMDD')) {
                dates.push(startDate.format('YYYY-MM-DD'));
                startDate = startDate.add(1, 'days');
            }
            dates.push(endDate.format('YYYY-MM-DD'));

            this.createPdf(dates, moment().year(date[0]).month(date[1] - 1).format('MMMM'), moment().year(date[0]).month(date[1] - 1).format('YYYY'));
        },
        createPdf:             async function (dates, monthName, year) {
            // Fetch an existing PDF document
            const basePdfUrl       = location.href.split('index.html').join('') + '/month.pdf';
            const existingPdfBytes = await fetch(basePdfUrl).then(res => res.arrayBuffer());

            // Load a PDFDocument from the existing PDF bytes
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            pdfDoc.setTitle('Calendario ' + monthName + ' ' + year);
            pdfDoc.setSubject('Calendario ' + monthName + ' ' + year);
            pdfDoc.setProducer('PDF calendars generator by Daniele Sabre');
            pdfDoc.setKeywords(['calendar', monthName, year]);
            pdfDoc.setCreationDate(new Date());
            pdfDoc.setModificationDate(new Date());

            // Get the first page of the document
            const pages     = pdfDoc.getPages();
            const firstPage = pages[0];

            // cancel lines using rectangles
            this.pdfDrawRectangles(firstPage);

            // write texts
            await this.pdfDrawTexts(pdfDoc, firstPage, monthName, year, dates);

            // Serialize the PDFDocument to bytes (a Uint8Array)
            const pdfBytes = await pdfDoc.save();

            // Trigger the browser to download the PDF document
            download(pdfBytes, this.month + '.pdf', 'application/pdf');
        },
        pdfDrawTexts:          async function (pdfDoc, page, monthName, year, dates) {
            // Embed the Helvetica font
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const texts         = [
                {
                    x:    95,
                    y:    558,
                    size: 20,
                    text: monthName + ''
                },
                {
                    x:    700,
                    y:    558,
                    size: 20,
                    text: year + ''
                }
            ];

            const datesChunks = [];
            const chunkSize   = 7;
            for (let i = 0; i < dates.length; i += chunkSize) {
                datesChunks.push(dates.slice(i, i + chunkSize));
            }

            datesChunks.forEach((dates, index1) => {
                dates.forEach((date, index2) => {
                    date = date.split('-').map(i => parseInt(i));
                    date = moment().year(date[0]).month(date[1] - 1).date(date[2]);

                    texts.push({
                        x:     118 + 113.5 * index2,
                        y:     491 - 96.5 * index1,
                        size:  12,
                        text:  date.format('DD'),
                        color: monthName === date.format('MMMM') ? rgb(0, 0, 0) : rgb(0.5, 0.5, 0.5)
                    });
                });
            });

            texts.forEach(options => {
                options.font  = helveticaFont;
                options.color = typeof options.color === 'undefined' ? rgb(0, 0, 0) : options.color;

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
                    x:      86,
                    y:      555.5,
                    width:  167,
                    height: 5
                },
                {
                    x:      588,
                    y:      555.5,
                    width:  171,
                    height: 5
                }
            ];

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
