import {
	BlocksFeature,
	LinkFeature,
	UploadFeature,
	lexicalEditor
} from '@payloadcms/richtext-lexical'

import showOptionsField from './showOptions'

export default function createPageTemplateFields({ readOnly = false } = {}) {
	const pageFields = [
		{
			type: 'row',
			fields: [
				// --- page.title
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
			]
		},
		// --- page.img_featured
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
		// --- page.richText
		{
			type: 'richText',
			name: 'richText',
			label: 'Rich Text',
			localized: true,
			required: false,
			admin: {
				condition: (data) => (data.shape && data.shape.includes('richText')) ? true : false,
				description: {
					en: 'Type "/" to open editor menu. "Ctrl + Shift + v" inserts text without formating.',
					de: 'Schrägstrich "/" öffnet ein Editor Menü. "Strg + Shift + v" fügt Text ohne Formatierung ein.'
				},
				readOnly: readOnly,
			},
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
		},
		// --- page.posts
		{
			type: 'group',
			name: 'posts',
			admin: {
				condition: (data) => (data.shape && data.shape.includes('posts')) ? true : false,
				hideGutter: true
			},
			fields: [
				// --- page.posts.type
				{
					type: 'relationship',
					name: 'type',
					relationTo: 'post-types',
					label: {
						de: 'Welche Posts sollen einbezogen werden?',
						en: 'Which posts should be included?'
					},
					//maxDepth: 0, // include the entire post-category (as it is not much data) <-- CHECK: If we really need this!
					hasMany: false, // <-- IMP: If I enable this I must make sure that iterateBlocks passes all types as attribute to the element
				},
				// --- page.posts.showOptions
				showOptionsField,
				{
					type: 'row',
					admin: {
						condition: (data, siblingData) => siblingData.showOptions
					},
					fields: [
						// --- page.posts.sortBy
						{
							type: 'radio',
							name: 'sortBy',
							label: {
								de: 'Sortierung',
								en: 'Order',
							},
							options: [
								{
									value: 'date',
									label: {
										en: 'Date',
										de: 'Datum'
									}
								},
								{
									value: 'tags',
									label: {
										en: 'Tags',
										de: 'Tags'
									}
								},
							],
							defaultValue: 'date',
						},
					]
				},
				{
					type: 'collapsible',
					label: {
						de: 'Benutzeroberfläche',
						en: 'User Interface'
					},
					admin: {
						initCollapsed: true,
						condition: (data, siblingData) => siblingData.showOptions
					},
					fields: [
						// --- page.posts.ui
						{
							type: 'group',
							name: 'ui',
							label: ' ',
							admin: {
								hideGutter: true,
								className: 'hide-group-label'
							},
							fields: [
								// --- page.posts.ui.isCollapsible
								{
									type: 'checkbox',
									name: 'isCollapsible',
									label: {
										de: 'Zusammenklappbar',
										en: 'Collapsible'
									},
									defaultValue: false,
								},
								// --- page.posts.ui.initState
								{
									type: 'radio',
									name: 'initState',
									label: {
										de: 'Ausgangszustand',
										en: 'Initial State'
									},
									admin: {
										condition: (data, siblingData) => siblingData.isCollapsible
									},
									options: [
										{
											value: 'collapsed',
											label: {
												de: 'Zusammengeklappt',
												en: 'Collapsed'
											}
										},
										{
											value: 'expanded',
											label: {
												de: 'Auseinandergeklappt',
												en: 'Expanded'
											}
										},
									],
									defaultValue: 'collapsed',
								},
								// --- page.posts.ui.include
								{
									type: 'select',
									name: 'include',
									label: {
										de: 'Welche Bedienelemente sollen angezeigt werden?',
										en: 'Which settings affecting all posts should be shown to the user?'
									},
									hasMany: true,
									admin: {
										isClearable: true,
									},
									options: [
										{
											value: 'tags',
											label: {
												de: 'Filter nach Tags',
												en: 'Filter by tags'
											}
										},
										{
											value: 'sortorder',
											label: {
												de: 'Sortierung',
												en: 'Sort Order'
											}
										},
										{
											value: 'searchbar',
											label: {
												de: 'Suchleiste',
												en: 'Searchbar'
											}
										},
										{
											value: 'toc',
											label: {
												de: 'Inhaltsverzeichnis',
												en: 'Table of Contents'
											}
										},
										{
											value: 'backToTopButton',
											label: {
												de: 'Back-to-Top Button',
												en: 'Back-to-Top Button'
											}
										},
									],
									defaultValue: [],
								},
							]
						},
					]
				}
			]
		}
	]

	return pageFields
}