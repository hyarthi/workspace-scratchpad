export class D3ForceNode {
	id: string;
	index: number;
	radius: number;
	text: string;
	fields: any[];
	selected: boolean;
	children: D3ForceNode[];
	width: number;

	constructor(in_id: string, cpref: string, idx: number, r: number, txt?: string, w?: number) {
		this.id = cpref + in_id;
		this.index = idx;
		this.radius = r;
		this.text = (txt ? txt : '');
		this.fields = [];
		this.selected = false;
		this.children = [];
		this.width = (w ? w : undefined);
	}
}