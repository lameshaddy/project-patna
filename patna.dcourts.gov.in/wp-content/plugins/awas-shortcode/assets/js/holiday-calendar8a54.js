(function ($) {

	$.fn.sHolidayCalender = function (options) {

		let containerClass = "scalender-container";
		let headerClass = "scalender-header";
		//let headerClass = "scalender-header accent-color accent-border-color";


		let settings = $.extend({
			datesArray: [],
			containerClass: "",
			headerClass: "",
			prevMonthText: "Previous Month",
			nextMonthText: "Next Month",
			satOff: 1,
		}, options);


		const nth = function (d) {
			if (d > 3 && d < 21) return d + "th";
			switch (d % 10) {
				case 1: return d + "st";
				case 2: return d + "nd";
				case 3: return d + "rd";
				default: return d + "th";
			}
		}

		let months = HolidayData.monthsList || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		let currentDate = new Date(); currentDate.setHours(0, 0, 0, 0);
		let currentYear = currentDate.getFullYear();
		let currentMonth = currentDate.getMonth();



		/* Generate List Of Days */

		let getDaysHtml = function (month, year, holidays) {

			let days =  ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
			let startDate = new Date(year, month - 1, 1);
			let daysArray = [];

			while (startDate.getMonth() == month - 1) {
				daysArray.push({ id: startDate.getDate(), day: days[startDate.getDay()], fullDate: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) })
				startDate.setDate(startDate.getDate() + 1);
			}

			let daysUl = $('<ul />');
			let dayStartsAt = days.indexOf(daysArray[0].day);
			let lastDay = 7;
			let saturdays = [];
			let saturdays_off = [];


			for (let i = 0; i < dayStartsAt; i++) {
				let li = $('<li aria-hidden="true" class="blank-date" />').append($('<span />'));
				daysUl.append(li);
			}

			//all saturday off
			for (let i = 0; i < daysArray.length; i++) {
				if (daysArray[i].day == 'sat') {
					saturdays.push(daysArray[i].id);
				}
			}

			if (settings.satOff == '1') {
				for (let i = 0; i < daysArray.length; i++) {
					saturdays_off.push(saturdays[i]);
				}
			}
			else if (settings.satOff == '2') {
				for (let i = 0; i < daysArray.length; i++) {
					if (i != 4 && i % 2 == 0) {
						saturdays_off.push(saturdays[i]);
					}
				}
			}
			else if (settings.satOff == '3') {
				for (let i = 0; i < daysArray.length; i++) {
					if (i == 1 || i == 2) {
						saturdays_off.push(saturdays[i]);
					}
				}
			}
			else if (settings.satOff == '4') {
				for (let i = 0; i < daysArray.length; i++) {
					if (i != 4 && i % 2 != 0) {
						saturdays_off.push(saturdays[i]);
					}
				}
			}
			else if (settings.satOff == '5') {
				for (let i = 0; i < daysArray.length; i++) {
					if (i == 1) {
						saturdays_off.push(saturdays[i]);
					}
				}
			}
			else if (settings.satOff == '6') {
				for (let i = 0; i < daysArray.length; i++) {
					if (i % 2 == 0) {
						saturdays_off.push(saturdays[i]);
					}
				}
			}


			for (let i = 0; i < daysArray.length; i++) {

				let holidayForThisDay = [];
				let li = $('<li>').text(daysArray[i].id);
				if (currentDate.getDate() == daysArray[i].id && year == currentDate.getFullYear() && (month - 1) == currentDate.getMonth()) {
					li.addClass('current-date');
				}

				if (daysArray[i].day == 'sun') li.addClass('weekend sunday');
				if (daysArray[i].day == 'sat') li.addClass('saturday');
				if (saturdays_off.indexOf(daysArray[i].id) != -1) li.addClass('weekend');

				$.each(holidays, function (key, value) {
					value.end_date.setHours(0, 0, 0, 0);
					value.start_date.setHours(0, 0, 0, 0);
					if (daysArray[i].fullDate.getTime() >= value.start_date.getTime() && daysArray[i].fullDate.getTime() <= value.end_date.getTime()){
						if(value.type == 'weekend-working'){li.removeClass('weekend');return;}
						holidayForThisDay.push(value);
					}
				})

				if (holidayForThisDay.length > 0) {

					li.addClass('has-holidays');
					$.each(holidayForThisDay, function (key, value) {
						li.addClass(value.type);
					})

					if (holidayForThisDay.length > 1) li.addClass('multiple');

					let holidayForThisDayHtml = '';

					$.each(holidayForThisDay, function (key, value) {
						holidayForThisDayHtml += '<p>' + value.title + '</p>';
					})

					li.wrapInner('<a href="javascript:void(0);" class="holidaysTag"></a>');
					li.append('<div class="h-tooltip">' + holidayForThisDayHtml + '</div>');

					let date = daysArray[i].fullDate.toLocaleDateString('en-US').split('/');
					li.find('a').data('clickedDate', date[2] + String(date[0]).padStart(2, '0') + String(date[1]).padStart(2, '0'));
				}
				li.find('a').attr('title', nth(daysArray[i].fullDate.getDate()) + ' ' + months[month - 1] + ' ' + daysArray[i].fullDate.getFullYear())
				daysUl.append(li);
				lastDay = days.indexOf(daysArray[i].day);
			}

			for (let i = lastDay + 1; i < days.length; i++) {
				let li = $('<li aria-hidden="true" class="blank-date"/>').append($('<span />'));
				daysUl.append(li);
			}

			return daysUl;

		}
		let $this = this;

		/* Header Next/Previous & Month Name */

		let calender = $('<div />').addClass(containerClass + ' ' + settings.containerClass + ' ' + $this.attr('class'));
		let header = $('<div />').addClass(headerClass + ' ' + settings.headerClass).data('visibleDate', currentDate);

		header.append('<a href="javascript:void(0)" class="scalender-prev fa fa-angle-left" title="' + settings.prevMonthText + '">')
			.append('<a href="javascript:void(0)" class="scalender-next fa fa-angle-right" title="' + settings.nextMonthText + '">')
			.append('<div class="scalender-month-name">' + months[currentMonth] + " " + currentYear + '</div>');

		calender.append(header);

		/* Header List Of Days Name */

		let days = HolidayData.daysList ||  ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
		let daysHeadContainer = $('<div class="scalender-header-days-name" />');
		let daysHeadUl = $('<ul />');

		$.each(days, function (index, value) {
			let li = $('<li />').append($('<span />').text(value.toUpperCase()));
			daysHeadUl.append(li);
		})

		daysHeadContainer.append(daysHeadUl);
		calender.append(daysHeadContainer);

		let daysContainer = $('<div class="scalender-days-inner"  /><div class="sc-loader"><span><i class="fa fa-spinner fa-spin"></i></span></div>');
		let daysList = $('<div class="scalender-days-list"  />');

		calender.append(daysContainer.append(daysList));

		/* holidays Holder */

		let holidaysHolder = $('<div />').addClass('scalender-holidays-by-date');
		holidaysHolder.append('<div class="scalender-holidays-date-heading">holidays</div>');
		holidaysHolder.append('<a class="sc-back sc-holiday-btn"><i class="fa fa-arrow-circle-left"></i></a><a class="sc-close sc-holiday-btn"><i class="fa fa-times-circle"></i></a>');
		let holidaysListHolder = $('<div class="sc-holidays-list" />').html('Loading Holidays..');
		holidaysHolder.append(holidaysListHolder);
		calender.append(holidaysHolder);

		let holidaysTypeInfo = $('<div />').addClass('holiday-type-info');
		holidaysTypeInfo.append('<ul><li><span></span>' + settings.gazettedHolidayText + '</li><li><span></span>' + settings.restrictedHolidayText + '</li><li><span></span>' + settings.weeklyHolidayText + '</li><li><span></span>' + settings.vacationHolidayText + '</li></ul>');
		calender.append(holidaysTypeInfo);

		$this.html(calender);

		let generateCalender = function (year, month) {
			$.ajax({
				async: true,
				url: HolidayData.ajaxUrl,
				method: 'GET',
				data: { action: 'calender_get_holidays_for_this_month', year: year, month: String(month).padStart(2, '0') },
				beforeSend: function () {
					//daysContainer.html('Loading Calender');
					daysContainer.find('.sc-loader').show();
					header.find('.scalender-prev,.scalender-next').addClass('disabled');

				},
				success: function (response) {
					let holidays = $.map(response.data.holidays, function (val, i) {
						val['start_date'] = new Date(val['start_date'].split('/').reverse().join('-'));
						val['end_date'] = new Date(val['end_date'].split('/').reverse().join('-'));
						return val;
					});

					/* List Of Days */
					let daysUl = getDaysHtml(month, year, holidays);
					daysList.html(daysUl);
					daysContainer.find('.sc-loader').hide();
					header.find('.scalender-prev,.scalender-next').removeClass('disabled');
				}
			})
		}

		generateCalender(currentDate.getFullYear(), currentDate.getMonth() + 1);

		/* On Click Previous/Next Button */

		$("body").on("click", ".scalender-prev,.scalender-next", function () {

			let visibleDate = $(this).parents('div').data('visibleDate');
			let date = new Date(visibleDate);

			if ($(this).hasClass('scalender-prev')) date.setMonth(date.getMonth() - 1)
			else date.setMonth(date.getMonth() + 1)

			generateCalender(date.getFullYear(), date.getMonth() + 1);

			$(calender).find('.scalender-month-name').html(months[date.getMonth()] + " " + date.getFullYear());

			$(this).parents('div').data('visibleDate', date);

		});

		return this;
	};

}(jQuery));