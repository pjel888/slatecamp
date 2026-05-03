#!/bin/bash
# Process 50 diverse articles - picks articles not yet processed
# Run from /Users/philiplewis/slatecamp

BASE="/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
FLAGS_DIR="/Users/philiplewis/slatecamp/.ai/14_fact_checking/flags"

# Pick diverse articles from different topic areas
# These are article directory names (not yet in the 186 completed)

ARTICLES=(
  # Design - 5 articles
  "lea-dsgn-003-04-core-concept--1673310d-fe41-40f3-ab75-0c7e90db42e1"
  "lea-dsgn-004-05-core-concept--ea6d06eb-e659-4092-ad67-14d4956cc4c6"
  "lea-dsgn-005-05-core-concept--40479f68-42a9-482a-960f-9901f522d086"
  "lea-dsgn-006-04-core-concept--2b843aa3-45d9-4421-ae00-107e94f28495"
  "lea-dsgn-007-04-core-concept--c9b1aadd-4843-4cf3-a551-6dd67678e508"

  # Structural - 5 articles
  "lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff"
  "lea-strc-002-01-core-concept--3fbb9789-4f15-4c22-a982-1b4686df8219"
  "lea-strc-003-01-core-concept--79ca7e09-9492-49b1-9289-88d444451275"
  "lea-strc-004-01-core-concept--2ef8093e-b636-42f7-8f25-55adcfc22821"
  "lea-strc-005-01-core-concept--dac86d82-085d-4627-bf1d-2e3ab4be9da3"

  # Materials - 5 articles
  "lea-matl-001-04-core-concept--c1f7906b-35f8-460b-bb03-f996ad25658e"
  "lea-matl-002-03-core-concept--42ec69b2-114a-423b-bba3-12cd5564f994"
  "lea-matl-003-04-core-concept--7dccfed0-8f85-47ad-b72b-8e5940d8276a"
  "lea-matl-004-06-core-concept--b055d93c-4f92-4608-b88b-ff729757f92e"
  "lea-matl-005-05-core-concept--8a3fed25-4fda-4d38-a3a9-0e452f0e1e75"

  # History - 5 articles (untouched sub-topics)
  "lea-hist-001-02-core-concept--e72bf24e-a816-4c4f-ae4b-f8e97c5d5519"
  "lea-hist-002-02-core-concept--48580f1e-3497-48f9-a87e-0f67c6e476b6"
  "lea-hist-004-02-core-concept--c0a5189b-4c67-47ad-bfd0-4b4d33df7247"
  "lea-hist-007-01-core-concept--cde95089-b874-42c5-8250-abc58ad7fae0"
  "lea-hist-008-01-core-concept--1f411bc4-4ca5-4bb2-ab46-e130e1b0a5e4"

  # Theory - 5 articles
  "lea-theo-001-07-core-concept--30832ba5-fbe9-4047-871a-aa4cb63ac616"
  "lea-theo-002-01-core-concept--62274e90-5cb3-4bc0-85a1-639858e47736"
  "lea-theo-004-01-core-concept--567ba614-9dcd-4c76-8bf3-74478fd1291f"
  "lea-theo-005-01-core-concept--128400dd-8642-4275-a64f-c411f6836d6d"
  "lea-theo-007-01-core-concept--5144f75e-e8ee-49a0-8dcf-2ded9c2b432c"

  # Planning - 4 articles
  "lea-plan-001-01-core-concept--d28bf43f-a588-4be3-8b79-8759d930aea4"
  "lea-plan-002-01-core-concept--50d41d7e-57cd-4280-b850-e6d2f89414a6"
  "lea-plan-003-02-core-concept--7c0e2fa5-7f3d-419a-b592-50346ac7ab2f"
  "lea-plan-004-01-core-concept--6a351c32-f48d-45fb-93f5-e60e6cd271c5"

  # Utilities - 5 articles
  "lea-util-001-07-core-concept--be3f2bf1-8d85-4c03-a047-ae1c2503d4cb"
  "lea-util-002-03-core-concept--903c66da-2864-48b0-b638-2ed218a173e2"
  "lea-util-003-02-core-concept--91727ebf-ee05-4aa8-a538-d8c599a1d9c9"
  "lea-util-005-03-core-concept--881027cd-2be0-4c93-af86-4f801ec16882"
  "lea-util-006-02-core-concept--dd8ec17f-7f5c-4652-9257-65811b1ead0c"

  # Ethics - 4 articles
  "lea-prac-eth-001-core-concept--6604a199-6687-435d-aeb1-ffdc46be7d23"
  "lea-prac-eth-002-core-concept--f769b43e-e467-4ce4-afd9-2d0152fe8d46"
  "lea-prac-eth-003-core-concept--9bc92dcd-8cce-4970-9111-13e21a72fb68"
  "lea-prac-eth-004-core-concept--cd6c1a20-eee6-4475-b0cc-239897d3f4d7"

  # Contract - 4 articles (unprocessed)
  "lea-prac-ctr-005-core-concept--5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5"
  "lea-prac-ctr-016-core-concept--4e28889a-cba3-4bf4-805c-ff0526910ee3"
  "lea-prac-ctr-017-core-concept--33f0a370-4f6f-46ba-b06f-edcce2168cdd"
  "lea-prac-ctr-018-core-concept--5e99dd5d-1394-46bc-998e-8915e2595b0b"

  # Special topic articles - 4 articles
  "case-study-hospital-mall-school--fc6f1ca7-340b-4188-8fc0-036e4e9d4498"
  "lodging-and-residential-accessibility--7a3b0ff7-407f-40cc-b398-fca6358f4db7"
  "21st-century-movements--60c3b78a-e1c7-4c5e-880e-f9526d6c570d"
  "ergonomics-in-furniture-design--691cf42d-0f6c-4686-b3d0-9a3bbd99da23"

  # Mastery articles - 2 articles
  "mastery-architectural-design--ce165155-2e81-4ed6-b14e-7d81dbdfa464"
  "mastery-building-materials--91294dec-6b87-4601-b9c1-a5b303447da4"

  # Remaining misc - 2 articles
  "microclimate-analysis--a81062b3-5724-4bdc-8f70-dcfd9ef51e46"
  "allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c"
)

echo "Total articles to process: ${#ARTICLES[@]}"
for dirname in "${ARTICLES[@]}"; do
  echo "$dirname"
done
