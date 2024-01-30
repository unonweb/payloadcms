import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'

export default function createPostFields({ readOnly = false } = {}) {
	const postFields = [
		{
			type: 'row',
			fields: [
				// --- post.title
				{
					type: 'text',
					name: 'title',
					label: {
						de: 'Titel',
						en: 'Title'
					},
					required: false,
					localized: true,
					index: true,
					admin: {
						condition: (data) => (data.shape && data.shape.includes('title')) ? true : false,
						readOnly: readOnly,
					}
				},
				// --- post.subtitle
				{
					type: 'text',
					name: 'subtitle',
					label: {
						de: 'Untertitel',
						en: 'Subtitle'
					},
					required: false,
					localized: true,
					admin: {
						condition: (data) => (data.shape && data.shape.includes('subtitle')) ? true : false,
						readOnly: readOnly,
					}
				},
			]
		},
		// --- post.description
		{
			type: 'textarea',
			name: 'description',
			label: {
				de: 'Kurze Zusammenfassung',
				en: 'Short Summary'
			},
			localized: true,
			maxLength: 190,
			admin: {
				condition: (data) => (data.shape && data.shape.includes('description')) ? true : false,
				description: {
					de: 'Wichtig für Suchmaschinen. Voraussetzung für die Darstellungsform des Posts als verlinkte Zusammenfassung. Max. Länge: 190 Zeichen.'
				},
				readOnly: readOnly,
			}
		},
		{
			type: 'row',
			fields: [
				// --- post.date_start
				{
					type: 'date',
					name: 'date_start',
					label: {
						de: 'Beginn',
						en: 'Start'
					},
					localized: false,
					defaultValue: () => new Date(),
					admin: {
						condition: (data) => (data.shape && (data.shape.includes('date_start') || data.shape.includes('date_end'))) ? true : false,
						date: {
							pickerAppearance: 'dayOnly',
							displayFormat: 'd.MM.yyyy'
						},
						width: '30%',
						readOnly: readOnly,
					},
				},
				// --- post.date_end
				{
					type: 'date',
					name: 'date_end',
					label: {
						de: 'Ende',
						en: 'End'
					},
					localized: false,
					defaultValue: () => new Date(),
					admin: {
						condition: (data) => (data.shape && data.shape.includes('date_end')) ? true : false,
						date: {
							pickerAppearance: 'dayOnly',
							displayFormat: 'd.MM.yyyy'
						},
						width: '30%',
						readOnly: readOnly,
					}
				},
				// --- post.date_time
				{
					type: 'date',
					name: 'date_time',
					label: {
						de: 'Uhrzeit',
						en: 'Time'
					},
					localized: false,
					admin: {
						condition: (data) => (data.shape && data.shape.includes('date_time')) ? true : false,
						date: {
							pickerAppearance: 'timeOnly',
							timeIntervals: '15',
							timeFormat: 'hh:mm'
						},
						width: '30%',
						placeholder: '00:00',
						readOnly: readOnly,
					},
					defaultValue: () => new Date(),
				},
			]
		},
		{
			type: 'row',
			fields: [
				// --- post.location_name
				{
					type: 'text',
					name: 'location_name',
					label: {
						de: 'Ort',
						en: 'Location'
					},
					required: false,
					localized: false,
					index: true,
					admin: {
						width: '25%',
						condition: (data) => (data.shape && data.shape.includes('location_name')) ? true : false,
						readOnly: readOnly,

					}
				},
				// --- post.location_url
				{
					type: 'text',
					name: 'location_url',
					label: {
						de: 'URL',
						en: 'URL'
					},
					localized: false,
					required: false,
					admin: {
						width: '25%',
						placeholder: 'https://developer.mozilla.org/en-US/',
						condition: (data) => (data.shape && data.shape.includes('location_url')) ? true : false,
						readOnly: readOnly,
					},
				},
			]
		},
		// --- post.location_coords
		{
			type: 'point',
			name: 'location_coords',
			label: {
				de: 'Koordinaten',
				en: 'Coordinates'
			},
			admin: {
				width: '25%',
				hidden: true,
				condition: (data) => (data.shape && data.shape.includes('location_coords')) ? true : false,
				readOnly: readOnly,
			}
		},
		// --- post.img_featured
		{
			type: 'upload',
			name: 'img_featured',
			label: {
				en: 'Featured Image',
				de: 'Meta-Bild'
			},
			relationTo: 'images',
			required: false,
			localized: false,
			admin: {
				condition: (data) => (data.shape && data.shape.includes('img_featured')) ? true : false,
				readOnly: readOnly,
			}
		},
		// --- post.richText
		{
			type: 'richText',
			name: 'richText',
			label: 'Rich Text',
			localized: true,
			required: false,
			editor: lexicalEditor({
				features: ({ defaultFeatures }) => [
					...defaultFeatures,
					LinkFeature({
						fields: [
							{
								type: 'checkbox',
								name: 'isDownload',
								label: {
									en: 'Download-Link',
									de: 'Download-Link'
								},
								defaultValue: false,
							},
						],
					}),
					/* UploadFeature({
						collections: {
							uploads: {
								// Example showing how to customize the built-in fields
								// of the Upload feature
								fields: [
									{
										name: 'caption',
										type: 'richText',
										editor: lexicalEditor(),
									},
								],
							},
						},
					}), */
					// This is incredibly powerful. You can re-use your Payload blocks
					// directly in the Lexical editor as follows:
					BlocksFeature({
						blocks: [
							//createImgBlock()
						],
					}),
				]
			}),
			admin: {
				condition: (data) => (data.shape && data.shape.includes('richText')) ? true : false,
				description: {
					en: 'Type "/" to open editor menu. "Ctrl + Shift + v" inserts text without formating.',
					de: 'Schrägstrich "/" öffnet ein Editor Menü. "Strg + Shift + v" fügt Text ohne Formatierung ein.'
				},
				readOnly: readOnly,
			}
		},
		// --- post.artists
		{
			type: 'array',
			name: 'artists',
			admin: {
				condition: (data) => (data.shape && data.shape.includes('artists')) ? true : false,
			},
			fields: [
				{
					type: 'row',
					fields: [
						// --- post.artists.name
						{
							type: 'text',
							name: 'name',
							label: {
								de: 'Ort',
								en: 'artists'
							},
							required: false,
							localized: false,
							index: true,
							admin: {
								width: '25%',
								readOnly: readOnly,
							}
						},
						// --- post.artists.url
						{
							type: 'text',
							name: 'url',
							label: {
								de: 'URL',
								en: 'URL'
							},
							localized: false,
							required: false,
							admin: {
								width: '25%',
								placeholder: 'https://developer.mozilla.org/en-US/',
								readOnly: readOnly,
							},
						},
					]
				},
			]
		},
	]

	return postFields
}