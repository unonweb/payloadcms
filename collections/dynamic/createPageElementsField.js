import getDefaultDocID from '../../hooks/beforeValidate/getDefaultDocID'

export default function createElementsFields() {
	const field = {
		type: 'group',
		name: 'elements',
		label: {
			de: 'Elemente',
			en: 'Elements'
		},
		admin: {
			condition: (data) => data.hasOwnPage,
			admin: {
				description: {
					en: 'Leave empty for default values',
					de: 'Leer lassen um Standard Werte zu setzen.'
				},
			},
		},
		fields: [
			{
				type: 'row',
				fields: [
					// --- element.useHeader
					{
						type: 'checkbox',
						name: 'useHeader',
						label: {
							de: 'Header',
							en: 'Header'
						},
						defaultValue: true,
					},
					// --- element.useNav
					{
						type: 'checkbox',
						name: 'useNav',
						label: {
							de: 'Navigation',
							en: 'Navigation'
						},
						defaultValue: true,
					},
					// --- element.useFooter
					{
						type: 'checkbox',
						name: 'useFooter',
						label: {
							de: 'Footer',
							en: 'Footer'
						},
						defaultValue: true,
					},
				]
			},
			// --- element.header
			{
				type: 'relationship',
				name: 'header',
				maxDepth: 0, // only return id
				relationTo: 'headers',
				required: false,
				admin: {
					condition: (data, siblingData, { user }) => (siblingData && siblingData.useHeader) ? true : false,
				},
				hooks: {
					beforeValidate: [
						async ({ data, originalDoc, value, field, context }) => await getDefaultDocID({ data, originalDoc, value, field, context })
					]
				},
			},
			// --- element.nav
			{
				type: 'relationship',
				name: 'nav',
				maxDepth: 0, // only return id
				relationTo: 'navs',
				required: false,
				admin: {
					condition: (data, siblingData, { user }) => (siblingData && siblingData.useNav) ? true : false,
				},
				hooks: {
					beforeValidate: [
						async ({ data, originalDoc, value, field, context }) => await getDefaultDocID({ data, originalDoc, value, field, context })
					]
				},
			},
			// --- element.footer
			{
				type: 'relationship',
				name: 'footer',
				maxDepth: 0, // only return id
				relationTo: 'footers',
				required: false,
				admin: {
					condition: (data, siblingData, { user }) => (siblingData && siblingData.useFooter) ? true : false,
				},
				hooks: {
					beforeValidate: [
						async ({ data, originalDoc, value, field, context }) => await getDefaultDocID({ data, originalDoc, value, field, context })
					]
				},
			},
		]
	}

	return field
}