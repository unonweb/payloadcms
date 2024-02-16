import createLexicalField from '../fields/createLexicalField'

const SLUG = 'grid-column'

export default function createGridColumn() {
	/*
		State:
			Experimental
		Notes:
			If I enable creating grid columns on richText level (in order to decrease nesting) 
			then I need to automatically wrap all content outside of explicitly created columns into a default column/block
			because otherwise grid would create a row for each paragraph, etc.
	*/
	const block = {
		slug: SLUG,
		labels: {
			singular: {
				en: 'Column',
				de: 'Spalte'
			},
			plural: {
				en: 'Columns',
				de: 'Spalten'
			}
		},
		fields: [
			// --- block.fraction
			{
				type: 'number',
				name: 'fraction',
				label: {
					en: 'Share',
					de: 'Anteil'
				},
				admin: {
					description: {
						de: '... am vorhandenen Platz',
						en: '... of the available space',
					}
				}
			},
			// --- block.richText
			createLexicalField(['img-gallery', 'map-leaflet', 'include-posts-flex', 'section', 'svg'], { showDescription: false })
		]
	}

	return block
}