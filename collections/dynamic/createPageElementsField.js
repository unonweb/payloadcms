import getDefaultDocID from '../../hooks/beforeValidate/getDefaultDocID.js'
import resetBrokenRelationship from '../../hooks/beforeValidate/resetBrokenRelationship.js'

export default function createElementsFields() {
	/* 
		Used in:
			- Post
			- Events
			- Products
	*/
	const field = {
		type: 'collapsible',
		label: {
			de: 'Elemente',
			en: 'Elements'
		},
		admin: {
			condition: (data) => data.hasOwnPage,
			description: {
				en: 'Leave empty for default values',
				de: 'Leer lassen um Standard Werte zu setzen.'
			},
		},
		fields: [
			{
				type: 'row',
				fields: [
					// --- post.useHeader
					{
						type: 'checkbox',
						name: 'useHeader',
						label: {
							de: 'Verwende Header',
							en: 'Use Header'
						},
						defaultValue: true,
					},
					// --- post.useNav
					{
						type: 'checkbox',
						name: 'useNav',
						label: {
							de: 'Verwende Navigation',
							en: 'Use Navigation'
						},
						defaultValue: true,
					},
					// --- post.useFooter
					{
						type: 'checkbox',
						name: 'useFooter',
						label: {
							de: 'Verwende Footer',
							en: 'Use Footer'
						},
						defaultValue: true,
					},
				]
			},
			// --- post.header
			{
				type: 'relationship',
				name: 'header',
				maxDepth: 0, // only return id
				relationTo: 'headers',
				filterOptions: ({ data }) => {
					return {
						site: { equals: data.site }, // only elements associated with this site
					}
				},
				required: false,
				admin: {
					condition: (data, siblingData, { user }) => (siblingData && siblingData.useHeader) ? true : false,
				},
				hooks: {
					beforeValidate: [
						async ({ data, originalDoc, siblingData, value, field, context, collection, req }) => {
							// return null if field is hidden by condition
							if (siblingData && !siblingData.useHeader) return null

							const fieldValue = value ?? data?.[field.name] ?? originalDoc?.[field.name] ?? null // in bulk operations 'value' is undefined; then if this field is updated 'data' holds the current value

							if (!fieldValue) {
								return await getDefaultDocID({ data, originalDoc, value, field, context, req })
							}
							else {
								return await resetBrokenRelationship(fieldValue, { field, context, collection, req })
							}
						}
					]
				},
			},
			// --- post.nav
			{
				type: 'relationship',
				name: 'nav',
				maxDepth: 0, // only return id
				relationTo: 'navs',
				filterOptions: ({ data }) => {
					return {
						site: { equals: data.site }, // only elements associated with this site
					}
				},
				required: false,
				admin: {
					condition: (data, siblingData, { user }) => (siblingData && siblingData.useNav) ? true : false,
				},
				hooks: {
					beforeValidate: [
						async ({ data, originalDoc, siblingData, value, field, context, collection, req }) => {
							// return null if field is hidden by condition
							if (siblingData && !siblingData.useNav) return null

							const fieldValue = value ?? data?.[field.name] ?? originalDoc?.[field.name] ?? null // in bulk operations 'value' is undefined; then if this field is updated 'data' holds the current value

							if (!fieldValue) {
								return await getDefaultDocID({ data, originalDoc, value, field, context, req })
							}
							else {
								return await resetBrokenRelationship(fieldValue, { field, context, collection, req })
							}
						}
					]
				},
			},
			// --- post.footer
			{
				type: 'relationship',
				name: 'footer',
				maxDepth: 0, // only return id
				relationTo: 'footers',
				filterOptions: ({ data }) => {
					return {
						site: { equals: data.site }, // only elements associated with this site
					}
				},
				required: false,
				admin: {
					condition: (data, siblingData, { user }) => (siblingData && siblingData.useFooter) ? true : false,
				},
				hooks: {
					beforeValidate: [
						async ({ data, originalDoc, siblingData, value, field, context, collection, req }) => {
							// return null if field is hidden by condition
							if (siblingData && !siblingData.useFooter) return null

							const fieldValue = value ?? data?.[field.name] ?? originalDoc?.[field.name] ?? null // in bulk operations 'value' is undefined; then if this field is updated 'data' holds the current value

							if (!fieldValue) {
								return await getDefaultDocID({ data, originalDoc, value, field, context, req })
							}
							else {
								return await resetBrokenRelationship(fieldValue, { field, context, collection, req })
							}
						}
					]
				},
			},
		]
	}

	return field
}