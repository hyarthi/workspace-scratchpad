import { CanvasAppPage } from './app.po';

describe('canvas-app App', () => {
  let page: CanvasAppPage;

  beforeEach(() => {
    page = new CanvasAppPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
