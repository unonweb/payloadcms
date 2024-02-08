import { Button } from "payload/components";
import { useFormFields } from "payload/components/forms";
import React from "react";

export const deployButton = () => {
	let siteID
	useFormFields(([fields]) => {
		siteID = fields.site.value
	});

	return (
		<>
			<a href={`/deploy-site?site=${siteID}`} target="_blank">
				<Button
					className="deploy-button"
					buttonStyle="secondary">Publish
				</Button>
			</a>
			<div class="field-description">Alle Änderungen hochladen - entweder auf eine Preview-Domain oder die Live-Domain. Das kann etwas dauern. Bitte erst am Ende der Sitzung ausführen.</div>
		</>
	);
};