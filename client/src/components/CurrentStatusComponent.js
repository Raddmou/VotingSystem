import React, { useContext, useEffect, useState } from "react";
import { WorkflowStatusLabel} from "../Common";
import { statusContext } from "./MainComponent";
import { providerContext } from "../App";

const CurrentStatusComponent = (props) => {
	const provider = useContext(providerContext);
	const currentState = useContext(statusContext);

	useEffect(() => {
	}, [currentState]);

	if(!provider)
		return null;	

	return ( 
		<div>
			<br></br>
			<table >
				<thead>
					<tr>
						{WorkflowStatusLabel.map((status, index) => 
							<td> 
								<span className={index == currentState ? "text-selected" : "text-notSelected"}>
									&nbsp;  
									{status}  
									&nbsp; 
								</span>
							</td>
						)}
					</tr>
				</thead>
			</table>
			<br></br>
		</div>
		
	);
}

export default CurrentStatusComponent;