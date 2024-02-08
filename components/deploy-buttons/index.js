import { Button } from "payload/components";
import { Label, useFormFields } from "payload/components/forms";
import React from "react";

export const deployButtons = ({ label }) => {
	let siteID 
	
	useFormFields(([fields]) => {
		siteID = fields.site.value
		 
	});
	
	return (
		<>
			<Label label={label} />
			<div className="deploy-buttons">
				<a href={`/deploy-site?branch=production&site=${siteID}`}>
					<Button
						className="deploy-button"
						buttonStyle="primary">Live
					</Button>
				</a>
				<a href={`/deploy-site?branch=preview&site=${siteID}`}>
					<Button
						className="deploy-button"
						buttonStyle="secondary">Preview
					</Button>
				</a>
			</div>
			<div class="field-description">Alle Änderungen hochladen - entweder auf eine Preview-Domain oder die Live-Domain. Das kann etwas dauern. Bitte erst am Ende der Sitzung ausführen.</div>
		</>
	);
};