select * from accounts;
select * from periods;
select * from plan;
select * from charges;
select * from categories;
SELECT (SELECT id FROM periods WHERE dateFrom < CURDATE()  AND dateTo is null  order by dateFrom desc LIMIT 1 ) as curId, id, dateFrom, dateTo FROM periods;
SELECT id FROM periods WHERE dateFrom < CURDATE()  AND dateTo is null  order by dateFrom LIMIT 1;

insert into periods (dateFrom, dateTo) values ('2014-01-01', null);

update periods set dateTo = null where id = 5;
SELECT id, Name FROM categories ORDER BY Name


SELECT p.periodId, p.categoryId, p.value FROM plan p, category c WHERE p.categoryId = c.id AND periodId = 15;

SELECT p.periodId, CONCAT(IFNULL(per.name, ' '), '(', DATE_FORMAT(per.dateFrom, '%d %m %Y'),' - ',IFNULL(DATE_FORMAT(per.dateTo, '%d %m %Y'),'null'), ')') as periodName,  c.name, p.value as planned 
  FROM plan p, categories c, periods per
 WHERE p.categoryId = c.id AND p.periodId = per.id 
 AND periodId = 15;
 
 SELECT ch.Category_id as categoryId, c.Name as categoryName, sum(Money) as money
  FROM charges ch, periods per, categories c
  WHERE c.id = ch.Category_id 
   AND ch.Date >= per.dateFrom AND ch.Date <= IFNULL(per.dateTo, CURDATE()+1) AND per.id = 15
   AND c.Name <> 'Пополнение'
GROUP BY ch.Category_id
ORDER BY money desc;

SELECT p.categoryId, c.Name as categoryName, value as money from plan p, categories c WHERE c.id = p.categoryId AND periodId = 15 ORDER BY money desc;
--plans only for categories with charges
 SELECT max(c.Name) as name, sum(Money) as spend, (SELECT plan.value from plan WHERE plan.periodId = p.id AND plan.categoryId = c.id) as planned
  FROM charges ch, categories c, periods p
  WHERE ch.Category_id = c.id AND ch.Date >= p.dateFrom AND ch.Date <= IFNULL(p.dateTo, CURDATE()+1) AND p.id = 15
GROUP BY ch.Category_id
ORDER BY planned desc, spend desc;

--select plans withou existing charges in category
select c.Name as name, p.value as planned,
(select sum(ch.Money) from charges ch
WHERE ch.Date >= per.dateFrom AND ch.Date <= IFNULL(per.dateTo, CURDATE()+1) AND ch.Category_id = c.id
GROUP BY ch.Category_id) as spend
from plan p, categories c, periods per
where p.periodId = per.id AND p.categoryId = c.id AND per.id = 15
ORDER BY planned desc, spend desc
;

select ch.Category_id, sum(ch.Money) from charges ch
WHERE ch.Date <=CURDATE()+1 AND ch.Category_id = 3 
GROUP BY ch.Category_id;
 
 SELECT id, name, money, (select sum(money)  from accounts) as totalAmount FROM accounts;
 
 SELECT p.periodId, CONCAT(IFNULL(per.name, ' '), '(', DATE_FORMAT(per.dateFrom, '%d %m %Y'),' - ',IFNULL(DATE_FORMAT(per.dateTo, '%d %m %Y'),'null'), ')') as periodName,  c.name, p.value as planned, 
   (SELECT sum(Money) FROM charges ch1 WHERE ch1.Date >= per.dateFrom AND ch1.Date <= IFNULL(per.dateTo, CURDATE()+1) AND ch1.Category_id = c.id GROUP BY ch1.Category_id) as spend
 FROM plan p, categories c, periods per
 WHERE p.categoryId = c.id AND p.periodId = per.id AND periodId = 15;