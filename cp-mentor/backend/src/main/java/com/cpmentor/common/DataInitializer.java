package com.cpmentor.common;

import com.cpmentor.problem.entity.Problem;
import com.cpmentor.problem.entity.Problem.Difficulty;
import com.cpmentor.problem.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds sample problems on startup so the app works immediately.
 * In production, the scheduler fetches real problems from LeetCode's GraphQL API.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProblemRepository problemRepository;

    @Override
    public void run(String... args) {
        if (problemRepository.count() > 0) return;

        log.info("Seeding sample problems...");

        problemRepository.saveAll(List.of(

            Problem.builder()
                .leetcodeId("1")
                .title("Two Sum")
                .slug("two-sum")
                .difficulty(Difficulty.EASY)
                .description("""
                    Given an array of integers nums and an integer target, return indices of the
                    two numbers such that they add up to target.

                    You may assume that each input would have exactly one solution, and you may
                    not use the same element twice.

                    You can return the answer in any order.

                    Example 1:
                    Input: nums = [2,7,11,15], target = 9
                    Output: [0,1]
                    Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

                    Example 2:
                    Input: nums = [3,2,4], target = 6
                    Output: [1,2]

                    Example 3:
                    Input: nums = [3,3], target = 6
                    Output: [0,1]
                    """)
                .constraints("""
                    2 <= nums.length <= 10^4
                    -10^9 <= nums[i] <= 10^9
                    -10^9 <= target <= 10^9
                    Only one valid answer exists.
                    """)
                .topics(List.of("Array", "Hash Table"))
                .exampleInput("nums = [2,7,11,15], target = 9")
                .exampleOutput("[0,1]")
                .build(),

            Problem.builder()
                .leetcodeId("3")
                .title("Longest Substring Without Repeating Characters")
                .slug("longest-substring-without-repeating-characters")
                .difficulty(Difficulty.MEDIUM)
                .description("""
                    Given a string s, find the length of the longest substring without repeating characters.

                    Example 1:
                    Input: s = "abcabcbb"
                    Output: 3
                    Explanation: The answer is "abc", with the length of 3.

                    Example 2:
                    Input: s = "bbbbb"
                    Output: 1

                    Example 3:
                    Input: s = "pwwkew"
                    Output: 3
                    """)
                .constraints("""
                    0 <= s.length <= 5 * 10^4
                    s consists of English letters, digits, symbols and spaces.
                    """)
                .topics(List.of("Hash Table", "String", "Sliding Window"))
                .exampleInput("s = \"abcabcbb\"")
                .exampleOutput("3")
                .build(),

            Problem.builder()
                .leetcodeId("121")
                .title("Best Time to Buy and Sell Stock")
                .slug("best-time-to-buy-and-sell-stock")
                .difficulty(Difficulty.EASY)
                .description("""
                    You are given an array prices where prices[i] is the price of a given stock on the ith day.

                    You want to maximize your profit by choosing a single day to buy one stock and choosing a
                    different day in the future to sell that stock.

                    Return the maximum profit you can achieve from this transaction.
                    If you cannot achieve any profit, return 0.

                    Example 1:
                    Input: prices = [7,1,5,3,6,4]
                    Output: 5
                    Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.

                    Example 2:
                    Input: prices = [7,6,4,3,1]
                    Output: 0
                    """)
                .constraints("""
                    1 <= prices.length <= 10^5
                    0 <= prices[i] <= 10^4
                    """)
                .topics(List.of("Array", "Dynamic Programming"))
                .exampleInput("prices = [7,1,5,3,6,4]")
                .exampleOutput("5")
                .build()
        ));

        log.info("Seeded {} problems. Visit http://localhost:8080/swagger-ui.html to explore the API.", problemRepository.count());
    }
}
