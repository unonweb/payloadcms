import { useField, Label } from 'payload/components/forms'
import { usePreferences } from 'payload/components/preferences';
import React, { useState, useEffect, useCallback } from 'react';

const colorPickerField = (args) => {
	// payload:
	// args.name: "primary"
	// args.path: "colors.primary"
	// args.defaultValue: "#74ea94"
	const { path, label, required } = args
	const { value, setValue } = useField({ path })
	const { getPreference, setPreference } = usePreferences()
	// react:
	const [color, setColor] = useState(args.defaultValue)

	useEffect(() => {
		async function getColorFromPayload() {
			const color = await getPreference(args.path);
			if (color) {
				setColor(color)	
			}
		}

		getColorFromPayload()

	}, [getPreference]);

	const updateColor = useCallback(newColor => {
		setValue(newColor)
		setColor(newColor)
		setPreference(args.path, newColor)
	}, [color, setPreference])

	return (
		<div>
			<Label
				htmlFor={path}
				label={label}
				required={required}
			/>
			<input
				type='color'
				onChange={(evt) => updateColor(evt.target.value)}
				value={color}
			/>
		</div>
	)
}

export default colorPickerField