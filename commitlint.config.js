module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "never"],
    "scope-case": [2, "always", "kebab-case"],
    "type-enum": [
      2,
      "always",
      [
        "fix", // bug fix, bumps PATCH
        "feat", // new feature, bumps MINOR
        "test", // adding/refactoring tests only
        "refactor", // code changes, without new fixes or features
        "style", // formatting changes, i.e. semicolons
        "docs", // updates to docs/comments
        "ci", // updates to ci/workflow config
        "build", // updates to build config
        "revert", // revert changes to unblock failing ci/tests
        "wip", // work-in-progress code commits as part of bigger features
        "dev", // general changes to developer-environment/internal tooling
        "chore", // bumping dependencies and other general maintenance
      ],
    ],
  },
};
