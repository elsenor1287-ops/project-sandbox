import re

with open('src/hooks/useAppState.test.ts', 'r') as f:
    text = f.read()

# Fix the middle import issue, but using normal quotes
fixed = re.sub(r'      expect\(result\.current\.state\.ballotOptions\)\.toHaveLength\(initialOptionsCount\);\nimport \{ calculateRCVResult \} from \'./useAppState\';\nimport \{ BallotOption, BallotSubmission \} from \'../types\';\n\ndescribe\(\'calculateRCVResult\'', '      expect(result.current.state.ballotOptions).toHaveLength(initialOptionsCount);\n    });\n  });\n});\n\nimport { calculateRCVResult } from \'./useAppState\';\nimport { BallotOption, BallotSubmission } from \'../types\';\n\ndescribe(\'calculateRCVResult\'', text)

with open('src/hooks/useAppState.test.ts', 'w') as f:
    f.write(fixed)
