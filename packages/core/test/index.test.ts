import {tacviewJS} from '../src/lib';
import {M3XML} from '../src/mockM3';

describe('tacviewJS', () => {
	const {
		getPlayerList,
		getPlayersByGroup,
		getPlayerTimeline,
	}: any = tacviewJS(M3XML);

	describe('getPlayerList()', () => {
		it('should return all all pilots by Aircraft type', () => {
			const expected = 'Silverado, Marks 1-1 | Zar, Bear 1-1 | Tony, Bus 1-2 | TiiZy, havk, Bus 1-1| Busdriver Actual, Pixelberg, Idiotilnya-1, Idiotilnya';

			expect(getPlayerList({byType: 'Aircraft'}).join(', ')).toBe(expected);
		});

		it('should return all all pilots by Helicopter type', () => {
			const expected = 'Debilka 3-1';

			expect(getPlayerList({byType: 'Helicopter'}).join(', ')).toBe(expected);
		});

		it('should return all aircraft by multi group RegeEx', () => {
			const expected = 'Silverado, Marks 1-1 | Zar, Bear 1-1 | Tony, Bus 1-2 | TiiZy, havk, Bus 1-1| Busdriver Actual, Pixelberg';

			expect(getPlayerList({byGroup: RegExp('Uzi|Colt')}).join(', ')).toBe(expected);
		});

		it('should return all aircraft by group Uzi RegeEx', () => {
			const expected = 'Silverado, Marks 1-1 | Zar, Bear 1-1 | Tony, Bus 1-1| Busdriver Actual, Pixelberg';

			expect(getPlayerList({byGroup: RegExp('Uzi')}).join(', ')).toBe(expected);
		});

		it('should return all aircraft by group Colt RegeEx', () => {
			const expected = 'Bus 1-2 | TiiZy, havk';

			expect(getPlayerList({byGroup: RegExp('Colt')}).join(', ')).toBe(expected);
		});

		it('should return empty array if nothing found', () => {
			expect(getPlayerList({byGroup: RegExp('Dodge')})).toStrictEqual([]);
		});

		it('should return empty array if no args are provided', () => {
			expect(getPlayerList()).toStrictEqual([]);
		});
	});

	describe('getPlayersByGroup()', () => {
		it('should return all aircraft by group Uzi', () => {
			const expected = 'Silverado, Marks 1-1 | Zar, Bear 1-1 | Tony, Bus 1-1| Busdriver Actual, Pixelberg';

			expect(getPlayersByGroup('Uzi').join(', ')).toBe(expected);
		});

		it('should return all aircraft by group Colt RegeEx', () => {
			const expected = 'Bus 1-2 | TiiZy, havk';

			expect(getPlayersByGroup('Colt').join(', ')).toBe(expected);
		});

		it('should return empty array if nothing found', () => {
			expect(getPlayersByGroup('Dodge')).toStrictEqual([]);
		});

		it('should return empty array if no args are provided', () => {
			expect(getPlayersByGroup()).toStrictEqual([]);
		});
	});

	describe('getRawPlayerTimeline()', () => {
		it('should return all events for a player', () => {
			console.log(getPlayerTimeline('Marks 1-1 | Zar'));
		});
	});
});
