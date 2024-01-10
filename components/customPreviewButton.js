import * as React from "react";

// Replace the default Preview button with a custom component.
export const CustomPreviewButton = ({
	DefaultButton,
	disabled,
	label,
	preview,
}) => {
	return <DefaultButton label={label} disabled={disabled} preview={preview} />;
};