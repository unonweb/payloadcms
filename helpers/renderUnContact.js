export default function renderUnContactData(block = {}) {

	/* const properties = [
		(block.name) ? `@name="${block.name}"` : '',
		(block.street) ? `@street="${block.street}"` : '',
		(block.number) ? `@number="${block.number}"` : '',
		(block.postcode) ? `@postcode="${block.postcode}"` : '',
		(block.place) ? `@place="${block.place}"` : '',
		(block.email) ? `@email="${block.email}"` : '',
		(block.phone) ? `@phone="${block.phone}"` : '',
	].join(' ') */

	const attributes = []
	const properties = []

	const innerHtml = [
		(block.name) ? `<span class='name'>${block.name}</span>` : '',
		(block.street) ? `<span class='street'>${block.street}</span>` : '',
		(block.number) ? `<span class='number'>${block.number}</span>` : '',
		(block.postcode) ? `<span class='postcode'>${block.postcode}</span>` : '',
		(block.place) ? `<span class='place'>${block.place}</span>` : '',
		(block.email) ? `<a href='mailto:info@haerer-geruestbau.de'>${block.email}</a>` : '',
		(block.phone) ? `<span class='phone'>${block.phone}</span>` : '',
	].join(' ')

	let html = /* html */ `
		<un-contact ${attributes} ${properties}>
			${innerHtml}
		</un-contact>
	`;

	return html

}