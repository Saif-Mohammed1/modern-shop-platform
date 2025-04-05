import type { TSESTree } from "@typescript-eslint/utils";
import type { Rule } from "eslint";

const isUnaryExpression = (
  node: TSESTree.Node | null | undefined
): node is TSESTree.UnaryExpression => {
  return node?.type === "UnaryExpression";
};

export default {
  rules: {
    "safe-jsx-handlers": {
      meta: {
        type: "problem",
        docs: {
          description: "Enforce safe JSX event handler patterns",
          recommended: "error",
        },
        messages: {
          voidOperator:
            "Avoid void operator in JSX attributes. Use arrow function with void.",
          uninvokedArrow:
            "Uninvoked function in arrow expression. Add parentheses to invoke.",
        },
        schema: [],
      },
      create(context: Rule.RuleContext) {
        return {
          JSXAttribute(node: TSESTree.JSXAttribute) {
            // Only process event handler attributes (starting with 'on')
            if (
              typeof node.name.name === "string" &&
              node.name.name.startsWith("on")
            ) {
              const value = node.value;
              if (value?.type === "JSXExpressionContainer") {
                const expr = value.expression;

                // 1. Check for void operator
                if (isUnaryExpression(expr) && expr.operator === "void") {
                  context.report({
                    node: expr as any,
                    messageId: "voidOperator",
                  });
                }

                // 2. Check uninvoked arrow functions
                if (expr.type === "ArrowFunctionExpression") {
                  const body = expr.body;
                  if (body.type === "Identifier") {
                    context.report({
                      node: body,
                      messageId: "uninvokedArrow",
                    });
                  }
                }
              }
            }
          },
        };
      },
    },
  },
};

// export default {
//   rules: {
//     "safe-jsx-handlers": {
//       meta: {
//         type: "problem",
//         docs: {
//           description: "Enforce safe JSX event handler patterns",
//           recommended: "error",
//         },
//         messages: {
//           directFunction:
//             "Direct function reference in JSX attribute. Use arrow function wrapper.",
//           voidOperator:
//             "Avoid void operator in JSX attributes. Use arrow function with void.",
//           uninvokedArrow:
//             "Uninvoked function in arrow expression. Add parentheses to invoke.",
//           leakedRender:
//             "Potential render leak. Wrap function in arrow expression.",
//         },
//         schema: [],
//       },
//       create(context: Rule.RuleContext) {
//         return {
//           JSXAttribute(node: TSESTree.JSXAttribute) {
//             const value = node.value;
//             if (!value || value.type !== "JSXExpressionContainer") return;

//             const expr = value.expression;

//             // Case 1: Direct function reference (onClick={logIt})
//             if (expr.type === "Identifier") {
//               context.report({
//                 node: expr ,
//                 messageId: "directFunction",
//                 suggest: [
//                   {
//                     desc: "Wrap in arrow function",
//                     fix: (fixer) =>
//                       fixer.replaceText(
//                         expr,
//                         `() => ${context.getSourceCode().getText(expr)}()`
//                       ),
//                   },
//                 ],
//               });
//             }

//             // Case 2: Void operator in attribute (onClick={void logIt})
//             if (expr.type === "UnaryExpression" && expr.operator === "void") {
//               context.report({
//                 node: expr,
//                 messageId: "voidOperator",
//                 suggest: [
//                   {
//                     desc: "Wrap in arrow function",
//                     fix: (fixer) =>
//                       fixer.replaceText(
//                         expr,
//                         `() => ${context.getSourceCode().getText(expr)}`
//                       ),
//                   },
//                 ],
//               });
//             }

//             // Case 3: Uninvoked arrow function (onClick={() => logIt})
//             if (expr.type === "ArrowFunctionExpression") {
//               const body = expr.body;

//               if (body.type === "Identifier") {
//                 context.report({
//                   node: body,
//                   messageId: "uninvokedArrow",
//                   suggest: [
//                     {
//                       desc: "Add invocation parentheses",
//                       fix: (fixer) =>
//                         fixer.replaceText(
//                           body,
//                           `${context.getSourceCode().getText(body)}()`
//                         ),
//                     },
//                   ],
//                 });
//               }

//               // Case 4: Potential render leak (onClick={logIt})
//               if (
//                 body.type === "CallExpression" &&
//                 body.callee.type === "Identifier" &&
//                 !expr.async &&
//                 expr.params.length === 0
//               ) {
//                 context.report({
//                   node: body.callee,
//                   messageId: "leakedRender",
//                   suggest: [
//                     {
//                       desc: "Wrap in arrow function",
//                       fix: (fixer) => fixer.insertTextBefore(body, "() => "),
//                     },
//                   ],
//                 });
//               }
//             }
//           },
//         };
//       },
//     },
//   },
// };
