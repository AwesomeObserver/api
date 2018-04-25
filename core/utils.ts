import * as fs from 'fs';
import * as path from 'path';

export function getFolderData(folderPath) {
	if (!fs.existsSync(folderPath)) {
		return {};
	}

	const files = fs.readdirSync(folderPath);
	let data = {};

	files.forEach((fileName) => {
		const fullFileName = `${folderPath}${fileName}`;
		const { ext, name } = path.parse(fullFileName);

		if (ext === '.ts' || ext === '.js') {
			data[name] = require(fullFileName);
		} else if (ext === '') {
			const folderData = getFolderData(`${folderPath}${name}/`);
			data = { ...data, ...folderData };
		}
	});

	return data;
}

export const reorder = (
	list: any[],
	startIndex: number,
	endIndex: number
): any[] => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

export function objFilter(dataObj: Object, filterObj?: Object): boolean {
	if (!filterObj) {
		return true;
	}

	let pass = true;

	for (let name of Object.keys(filterObj)) {
		let isEqual = filterObj[name] === dataObj[name];

		if (!isEqual) {
			pass = false;
			break;
		}
	}

	return pass;
}

export function parsePlaySource(str: string) {
	const [sourceId, start] = str.split(':').map((e) => parseInt(e, 10));
	return { sourceId, start };
}

export const uniq = (array) => {
	return array.filter((value, index, self) => {
		return self.indexOf(value) === index;
	});
};


export const btoa = (str) => {
	return Buffer.from(str, 'binary').toString('base64');
}