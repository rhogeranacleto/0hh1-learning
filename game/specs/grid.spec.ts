import { Grid } from '../grid';

describe('Grid', () => {

  let grid: Grid;

  beforeEach(() => {

    grid = new Grid(4);
  })

  it('should be constructed correctly', () => {

    expect(grid).toBeInstanceOf(Grid);
    expect(grid.getValues()).toHaveLength(0);
  });

  it('should load with 0 values', () => {

    grid.load();
    expect(grid.getValues()).toHaveLength(16);
  });

  it('should load with 0 values', () => {

    grid.load([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect(grid.getValues()).toHaveLength(16);
    expect(grid.getValues()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  it.each([
    [[1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 2]],
    [[0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0, 0]],
    [[1, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 1, 2, 0, 0]],
    [[0, 0, 0, 2, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 2]],
    [[0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0]],
    [[0, 1, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1]],
    [[0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 2]],
    [[1, 1, 0, 0, 0, 1, 1, 0, 0, 2, 1, 1, 0, 2, 2, 1]],
    [[1, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 1]],
    [[2, 1, 1, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 2, 2, 1]]
  ])('should isValid return true with %p', values => {

    grid.load(values);
    expect(grid.isValid()).toBe(true);
  });

  it.each([
    [[0, 0, 2, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 2]],
    [[0, 0, 0, 2, 0, 0, 0, 0, 1, 2, 2, 1, 1, 2, 2, 1]],
    [[0, 2, 0, 2, 0, 1, 0, 0, 0, 2, 2, 0, 1, 2, 0, 0]],
    [[1, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0]],
    [[1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 1, 2, 2, 0]],
    [[1, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0]],
    [[1, 1, 1, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 2, 2, 0]],
    [[1, 1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 1]],
    [[2, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1]]
  ])('should not be valid with %p', values => {

    grid.load(values);
    expect(grid.isValid()).toBe(false);
  });

  describe.each([
    [[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 1]],
    [[2, 1, 2, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 2, 1, 2]],
    [[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 1]],
    [[2, 1, 2, 1, 1, 1, 2, 2, 1, 2, 1, 2, 2, 2, 1, 1]],
    [[2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1]],
    [[1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1, 2]]
  ])('With game %p', values => {

    it('should fill a valid game', () => {

      grid.load();

      for (let i = 0; i < values.length; i++) {

        const element = values[i];

        grid.tiles[i].value = element;
        expect(grid.isValid()).toBe(true);
      }
    });

    it('should change random value and invalidate the grid', () => {

      grid.load(values);

      expect(grid.isValid()).toBe(true);

      const randomIndex = Math.floor(Math.random() * (15 - 0)) + 0;

      const value = grid.tiles[randomIndex].value;

      grid.tiles[randomIndex].value = value === 1 ? 2 : 1;

      expect(grid.isValid()).toBe(false);
    });
  });

  it('should generateFast generate a valid grid 20 time', () => {

    for (let i = 0; i < 20; i++) {

      grid.load();
      grid.generateFast();

      expect(grid.isValid()).toBe(true);
      expect(grid.getEmptyTiles()).toHaveLength(0);
    }
  });

  it('should generateFast generate a valid grid and breakDown free some tiles 20 time', () => {

    for (let i = 0; i < 20; i++) {

      grid.load();
      grid.generateFast();

      expect(grid.isValid()).toBe(true);

      grid.breakDown();

      expect(grid.getEmptyTiles().length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should be wrong with three on row', () => {
    
    grid.load();

    grid.tiles[0].value = 1;
    grid.tiles[1].value = 1;
    grid.tiles[2].value = 1;

    expect(grid.isValid()).toBe(false);
  });

  it('should be wrong with three on column', () => {
    
    grid.load();

    expect(grid.isValid()).toBe(true);

    grid.tiles[0].value = 1;
    grid.tiles[4].value = 1;
    grid.tiles[8].value = 1;

    expect(grid.isValid()).toBe(false);
  });

  it('should be wrong not equal on row', () => {
    
    grid.load();

    expect(grid.isValid()).toBe(true);

    grid.tiles[0].value = 1;
    grid.tiles[1].value = 1;
    grid.tiles[2].value = 2;
    grid.tiles[3].value = 1;

    expect(grid.isValid()).toBe(false);
  });

  it('should be wrong not equal on column', () => {
    
    grid.load();

    expect(grid.isValid()).toBe(true);

    grid.tiles[0].value = 1;
    grid.tiles[4].value = 2;
    grid.tiles[8].value = 1;
    grid.tiles[12].value = 1;

    expect(grid.isValid()).toBe(false);
  });

  it('should be wrong 2 rows equals', () => {
    
    grid.load();

    expect(grid.isValid()).toBe(true);

    grid.tiles[0].value = 1;
    grid.tiles[1].value = 2;
    grid.tiles[2].value = 2;
    grid.tiles[3].value = 1;

    grid.tiles[4].value = 1;
    grid.tiles[5].value = 2;
    grid.tiles[6].value = 2;
    grid.tiles[7].value = 1;

    expect(grid.isValid()).toBe(false);
  });

  it('should be wrong 2 columns equals', () => {
    
    grid.load();

    expect(grid.isValid()).toBe(true);

    grid.tiles[0].value = 1;
    grid.tiles[4].value = 2;
    grid.tiles[8].value = 1;
    grid.tiles[12].value = 2;

    grid.tiles[2].value = 1;
    grid.tiles[6].value = 2;
    grid.tiles[10].value = 1;
    grid.tiles[14].value = 2;

    expect(grid.isValid()).toBe(false);
  });
});