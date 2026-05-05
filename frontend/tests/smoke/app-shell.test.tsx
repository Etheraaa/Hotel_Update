import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "../../app/layout";

test("renders global shell title", () => {
  const html = renderToStaticMarkup(
    <RootLayout>
      <div>child</div>
    </RootLayout>
  );

  expect(html).toContain("酒店升房情报");
});
