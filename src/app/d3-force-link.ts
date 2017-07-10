export class D3ForceLink {
	id: string;
	source: string;
	target: string;
	weight: number;

	constructor(in_id: string, src: string, tgt: string, wght?: number) {
		this.id = in_id;
		this.source = src;
		this.target = tgt;
		this.weight = (wght ? wght : 1);
	}
}