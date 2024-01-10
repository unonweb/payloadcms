export default function createImgsArray({
	label = { de: 'Bilder', en: 'Images' },
	description = { de: '', en: '' },
	setDefault = false,
}, ...addFields) {

	const field = {
		type: 'array',
		name: 'images',
		label: label,
		labels: {
			singular: {
				en: 'Image',
				de: 'Bild'
			},
			plural: {
				en: 'Images',
				de: 'Bilder'
			}
		},
		admin: {
			description: description,
			initCollapsed: true,
		},
		defaultValue: setDefault('images', 'first', 'array'),
		fields: [
			{
				type: 'upload',
				name: 'rel',
				relationTo: 'images',
				label: {
					en: 'Image',
					de: 'Bild'
				},
				required: true,
				defaultValue: setDefault('images', 'first', 'item')
			},
			...addFields
		],
	}

	return field
}

async function setDefault(colSlug = '', mode = 'first', returnType = 'item') {
	return async function ({ user }) {
		if (user) {
			const res = await fetch(`/api/images${colSlug}`)
			if (res.ok) {
				const data = await res.json()
				switch (mode) {
					case 'first':
						if (data?.docs[0]?.id && returnType === 'item') return data.docs[0].id		
						if (data?.docs[0]?.id && returnType === 'array') return [data.docs[0]]
						else return null
						break;
				}
			}
		}
	}
}