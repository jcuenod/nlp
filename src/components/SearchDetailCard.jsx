import React from 'react'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography';

const SearchDetailCard = ({ heading, values }) =>
	<Card style={{ display: "inline-block", margin: "0.5em" }}>
		<CardContent>
			<Typography gutterBottom>
				{heading}
			</Typography>
			<Table size="small">
				<TableBody align="right">
					{values.map(({ key, value }) =>
						<TableRow key={`${key}-${value}`}>
							<TableCell style={{ fontSize: "small", border: "none" }}>{key}</TableCell>
							<TableCell style={{ fontWeight: "bold", border: "none" }}>{value}</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</CardContent>
	</Card>

export default SearchDetailCard