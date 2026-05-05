import { createGeneratorService } from "../../src/services/generatorService";

test("generates a polite chinese message with hotel, scenario, membership and goal", () => {
  const service = createGeneratorService();

  const response = service.generateMessage({
    hotel_name: "上海静安瑞吉酒店",
    scenarios: ["纪念日", "想要安静"],
    membership_level: "Platinum",
    goal_request: "更高楼层 / 更好景观",
    tone: "礼貌自然",
    additional_context: "这次只住一晚，希望入住时沟通得自然一点。"
  });

  expect(response.message).toContain("上海静安瑞吉酒店");
  expect(response.message).toContain("纪念日");
  expect(response.message).toContain("Platinum");
  expect(response.message).toContain("更高楼层");
  expect(response.message).toContain("感谢");
  expect(response.message.length).toBeGreaterThanOrEqual(80);
});

test("generates an english message when the user input is in english", () => {
  const service = createGeneratorService();

  const response = service.generateMessage({
    hotel_name: "Conrad Tokyo",
    scenarios: ["Better view"],
    membership_level: "Gold",
    goal_request: "Room upgrade",
    tone: "商务正式",
    additional_context: "We will be arriving late in the evening."
  });

  expect(response.message).toContain("Conrad Tokyo");
  expect(response.message).toContain("Gold");
  expect(response.message).toContain("room upgrade");
  expect(response.message).toContain("Thank you");
});
