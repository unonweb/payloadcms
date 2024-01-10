export default function createImgField() {

	const field = {
		type: 'upload',
		name: 'img',
		label: {
			en: 'Image',
			de: 'Bild'
		},
		relationTo: 'images',
		required: true,
	}

	return field
}