module.exports = function dateConvertToLocal(dateStr, dateStyle, locale) {

	dateStyle = (dateStyle === 'year') ? { year: 'numeric' } : { dateStyle: dateStyle }
	return new Date(dateStr).toLocaleString(locale, dateStyle)
}

// works in dev mode